package controllers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"maternal-neonatal-health/models"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Dependencies for the FeedController
type FeedController struct {
	PostCollection    *mongo.Collection
	CommentCollection *mongo.Collection
	RabbitChannel     *amqp.Channel
}

// CreatePostRequest defines the expected JSON body for creating a post.
type CreatePostRequest struct {
	Text   string   `json:"text"`
	Cohort string   `json:"cohort"`
	Images []string `json:"images"`
}

// RabbitMQMessage is the structure for the message published to the pii_stripper_queue.
type RabbitMQMessage struct {
	PostID   string `json:"post_id"`
	Text     string `json:"text"`
	Cohort   string `json:"cohort"`
	District string `json:"district"`
}

// CreatePostHandler handles the creation of a new post.
func (fc *FeedController) CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userName, _ := r.Context().Value("userName").(string)
	userDistrict, _ := r.Context().Value("userDistrict").(string)
	userAvatarHue, _ := r.Context().Value("userAvatarHue").(int)

	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		http.Error(w, `{"error": "invalid user id"}`, http.StatusBadRequest)
		return
	}

	var req CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "invalid request body"}`, http.StatusBadRequest)
		return
	}

	post := models.Post{
		ID:              primitive.NewObjectID(),
		AuthorID:        userID,
		AuthorName:      userName,
		AuthorDistrict:  userDistrict,
		AuthorAvatarHue: userAvatarHue,
		Cohort:          req.Cohort,
		Text:            req.Text,
		Images:          req.Images,
		Likes:           []primitive.ObjectID{},
		CreatedAt:       time.Now(),
	}

	_, err = fc.PostCollection.InsertOne(r.Context(), post)
	if err != nil {
		http.Error(w, `{"error": "failed to save post"}`, http.StatusInternalServerError)
		return
	}

	msgBody, _ := json.Marshal(RabbitMQMessage{
		PostID:   post.ID.Hex(),
		Text:     post.Text,
		Cohort:   post.Cohort,
		District: post.AuthorDistrict,
	})

	_ = fc.RabbitChannel.PublishWithContext(
		r.Context(),
		"",
		"pii_stripper_queue",
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        msgBody,
		},
	)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(post.ToResponse(userIDStr, nil))
}

// GetFeedHandler retrieves posts for a specific cohort with their comments.
func (fc *FeedController) GetFeedHandler(w http.ResponseWriter, r *http.Request) {
	userIDStr, _ := r.Context().Value("userID").(string)
	currentUserID, _ := primitive.ObjectIDFromHex(userIDStr)

	cohort := r.URL.Query().Get("cohort")
	if cohort == "" {
		if ctxCohort, ok := r.Context().Value("cohort").(string); ok {
			cohort = ctxCohort
		}
	}

	if cohort == "" {
		http.Error(w, `{"error": "cohort is required"}`, http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	filter := bson.M{"cohort": cohort}
	opts := options.Find().SetSort(bson.M{"created_at": -1})

	cursor, err := fc.PostCollection.Find(ctx, filter, opts)
	if err != nil {
		http.Error(w, `{"error": "failed to fetch posts"}`, http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var posts []models.Post
	if err := cursor.All(ctx, &posts); err != nil {
		http.Error(w, `{"error": "failed to decode posts"}`, http.StatusInternalServerError)
		return
	}

	postResponses := make([]models.PostResponse, 0, len(posts))
	for _, dbPost := range posts {
		log.Printf("Fetched Post %s - DB Likes Array Length: %d", dbPost.ID.Hex(), len(dbPost.Likes))

		commentCursor, err := fc.CommentCollection.Find(ctx, bson.M{"post_id": dbPost.ID})
		var comments []models.Comment
		if err == nil {
			commentCursor.All(ctx, &comments)
			commentCursor.Close(ctx)
		}

		// Explicitly calculate likes count and check if liked by current user
		liked := false
		for _, id := range dbPost.Likes {
			if id == currentUserID {
				liked = true
				break
			}
		}

		resp := dbPost.ToResponse(userIDStr, comments)
		resp.Likes = len(dbPost.Likes) // Explicit assignment
		resp.Liked = liked             // Explicit assignment
		postResponses = append(postResponses, resp)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(postResponses)
}

// ToggleLikeRequest defines the expected JSON body for toggling a like.
type ToggleLikeRequest struct {
	PostID string `json:"post_id"`
}

// ToggleLikeHandler atomic toggle of a user ID in the likes array.
func (fc *FeedController) ToggleLikeHandler(w http.ResponseWriter, r *http.Request) {
	var req ToggleLikeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "invalid request body"}`, http.StatusBadRequest)
		return
	}

	postID, err := primitive.ObjectIDFromHex(req.PostID)
	if err != nil {
		http.Error(w, `{"error": "invalid post_id"}`, http.StatusBadRequest)
		return
	}

	userIDStr, ok := r.Context().Value("userID").(string)
	if !ok || userIDStr == "" {
		// Default to testing ID if empty
		userIDStr = "65f1a2b3c4d5e6f7a8b9c0d1"
	}
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		log.Printf("Error: Invalid userID hex string: %s", userIDStr)
		http.Error(w, `{"error": "invalid user id"}`, http.StatusInternalServerError)
		return
	}

	log.Printf("Attempting ToggleLike - PostID: %s, UserID: %s", postID.Hex(), userID.Hex())

	// 1. Try to pull the user ID (remove like)
	res, err := fc.PostCollection.UpdateOne(r.Context(), bson.M{"_id": postID}, bson.M{"$pull": bson.M{"likes": userID}})
	if err != nil {
		log.Printf("Error during pull: %v", err)
		http.Error(w, `{"error": "failed to toggle like (pull)"}`, http.StatusInternalServerError)
		return
	}

	log.Printf("Pull Result - MatchedCount: %d, ModifiedCount: %d", res.MatchedCount, res.ModifiedCount)

	if res.MatchedCount == 0 {
		log.Printf("ToggleLike Failed: Post %s not found", postID.Hex())
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "post not found"})
		return
	}

	if res.ModifiedCount == 0 {
		// 2. If nothing was pulled (they hadn't liked it yet), add it
		resAdd, err := fc.PostCollection.UpdateOne(r.Context(), bson.M{"_id": postID}, bson.M{"$addToSet": bson.M{"likes": userID}})
		if err != nil {
			log.Printf("Error during addToSet: %v", err)
			http.Error(w, `{"error": "failed to toggle like (add)"}`, http.StatusInternalServerError)
			return
		}
		log.Printf("Add Result - MatchedCount: %d, ModifiedCount: %d", resAdd.MatchedCount, resAdd.ModifiedCount)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// CreateCommentRequest defines the body for creating a comment.
type CreateCommentRequest struct {
	PostID string `json:"post_id"`
	Text   string `json:"text"`
}

// CreateCommentHandler inserts a new comment with relationship tracking.
func (fc *FeedController) CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userName, _ := r.Context().Value("userName").(string)
	userDistrict, _ := r.Context().Value("userDistrict").(string)
	userAvatarHue, _ := r.Context().Value("userAvatarHue").(int)
	userID, _ := primitive.ObjectIDFromHex(userIDStr)

	var req CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "invalid request body"}`, http.StatusBadRequest)
		return
	}

	postID, err := primitive.ObjectIDFromHex(req.PostID)
	if err != nil {
		http.Error(w, `{"error": "invalid post_id"}`, http.StatusBadRequest)
		return
	}

	comment := models.Comment{
		ID:              primitive.NewObjectID(),
		PostID:          postID,
		AuthorID:        userID,
		AuthorName:      userName,
		AuthorDistrict:  userDistrict,
		AuthorAvatarHue: userAvatarHue,
		Text:            req.Text,
		Likes:           []primitive.ObjectID{},
		CreatedAt:       time.Now(),
	}

	_, err = fc.CommentCollection.InsertOne(r.Context(), comment)
	if err != nil {
		http.Error(w, `{"error": "failed to save comment"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(comment.ToResponse(userIDStr))
}
