package models

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Post represents the database schema for a community post.
type Post struct {
	ID              primitive.ObjectID   `bson:"_id" json:"id"`
	AuthorID        primitive.ObjectID   `bson:"author_id" json:"author_id"`
	AuthorName      string               `bson:"author_name" json:"author_name"`
	AuthorDistrict  string               `bson:"author_district" json:"author_district"`
	AuthorAvatarHue int                  `bson:"author_avatar_hue" json:"author_avatar_hue"`
	Cohort          string               `bson:"cohort" json:"cohort"`
	Text            string               `bson:"text" json:"text"`
	Images          []string             `bson:"images" json:"images"`
	Likes           []primitive.ObjectID `bson:"likes" json:"likes"`
	CreatedAt       time.Time            `bson:"created_at" json:"created_at"`
}

// Comment represents the database schema for a post comment.
type Comment struct {
	ID              primitive.ObjectID   `bson:"_id" json:"id"`
	PostID          primitive.ObjectID   `bson:"post_id" json:"post_id"`
	AuthorID        primitive.ObjectID   `bson:"author_id" json:"author_id"`
	AuthorName      string               `bson:"author_name" json:"author_name"`
	AuthorDistrict  string               `bson:"author_district" json:"author_district"`
	AuthorAvatarHue int                  `bson:"author_avatar_hue" json:"author_avatar_hue"`
	Text            string               `bson:"text" json:"text"`
	Likes           []primitive.ObjectID `bson:"likes" json:"likes"`
	CreatedAt       time.Time            `bson:"created_at" json:"created_at"`
}

// PostResponse is the clean, JSON-friendly structure sent to the client.
type PostResponse struct {
	ID              string            `json:"id"`
	AuthorID        string            `json:"author_id"`
	AuthorName      string            `json:"author_name"`
	AuthorDistrict  string            `json:"author_district"`
	AuthorAvatarHue int               `json:"author_avatar_hue"`
	Cohort          string            `json:"cohort"`
	Text            string            `json:"text"`
	Images          []string          `json:"images"`
	Likes           int               `json:"likes"`
	Liked           bool              `json:"liked"`
	Comments        []CommentResponse `json:"comments"`
	TimeAgo         string            `json:"timeAgo"`
	CreatedAt       time.Time         `json:"created_at"`
}

// CommentResponse is the clean, JSON-friendly structure for a comment.
type CommentResponse struct {
	ID              string    `json:"id"`
	PostID          string    `json:"post_id"`
	AuthorID        string    `json:"author_id"`
	AuthorName      string    `json:"author_name"`
	AuthorDistrict  string    `json:"author_district"`
	AuthorAvatarHue int       `json:"author_avatar_hue"`
	Text            string    `json:"text"`
	Likes           int       `json:"likes"`
	Liked           bool      `json:"liked"`
	TimeAgo         string    `json:"timeAgo"`
	CreatedAt       time.Time `json:"created_at"`
}

// ToResponse converts a raw DB Post struct into a clean PostResponse for the API.
// It calculates the likes count, checks if the targetUserID has liked the post,
// and generates a dynamic timeAgo string.
func (p *Post) ToResponse(targetUserID string, comments []Comment) PostResponse {
	liked := false
	targetID, err := primitive.ObjectIDFromHex(targetUserID)
	if err == nil {
		for _, id := range p.Likes {
			if id == targetID {
				liked = true
				break
			}
		}
	}

	commentResponses := make([]CommentResponse, 0, len(comments))
	for _, c := range comments {
		commentResponses = append(commentResponses, c.ToResponse(targetUserID))
	}

	return PostResponse{
		ID:              p.ID.Hex(),
		AuthorID:        p.AuthorID.Hex(),
		AuthorName:      p.AuthorName,
		AuthorDistrict:  p.AuthorDistrict,
		AuthorAvatarHue: p.AuthorAvatarHue,
		Cohort:          p.Cohort,
		Text:            p.Text,
		Images:          p.Images,
		Likes:           len(p.Likes),
		Liked:           liked,
		Comments:        commentResponses,
		TimeAgo:         FormatTimeAgo(p.CreatedAt),
		CreatedAt:       p.CreatedAt,
	}
}

// ToResponse converts a raw DB Comment struct into a clean CommentResponse for the API.
func (c *Comment) ToResponse(targetUserID string) CommentResponse {
	liked := false
	targetID, err := primitive.ObjectIDFromHex(targetUserID)
	if err == nil {
		for _, id := range c.Likes {
			if id == targetID {
				liked = true
				break
			}
		}
	}

	return CommentResponse{
		ID:              c.ID.Hex(),
		PostID:          c.PostID.Hex(),
		AuthorID:        c.AuthorID.Hex(),
		AuthorName:      c.AuthorName,
		AuthorDistrict:  c.AuthorDistrict,
		AuthorAvatarHue: c.AuthorAvatarHue,
		Text:            c.Text,
		Likes:           len(c.Likes),
		Liked:           liked,
		TimeAgo:         FormatTimeAgo(c.CreatedAt),
		CreatedAt:       c.CreatedAt,
	}
}

// FormatTimeAgo calculates a human-readable duration since the given time.
func FormatTimeAgo(t time.Time) string {
	duration := time.Since(t)
	if duration.Seconds() < 60 {
		return "just now"
	}
	if duration.Minutes() < 60 {
		return fmt.Sprintf("%.0fm ago", duration.Minutes())
	}
	if duration.Hours() < 24 {
		return fmt.Sprintf("%.0fh ago", duration.Hours())
	}
	days := duration.Hours() / 24
	if days < 7 {
		return fmt.Sprintf("%.0fd ago", days)
	}
	if days < 30 {
		return fmt.Sprintf("%.0fw ago", days/7)
	}
	return t.Format("Jan 2, 2006")
}
