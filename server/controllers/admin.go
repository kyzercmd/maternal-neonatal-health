package controllers

import (
	"encoding/json"
	"net/http"

	"maternal-neonatal-health/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// AdminController handles administrative operations.
type AdminController struct {
	UserCollection *mongo.Collection
}

// UserIDRequest defines the body for approval/rejection requests.
type UserIDRequest struct {
	UserID string `json:"user_id"`
}

// ListPendingVerificationsHandler returns users with 'pending_nid' status and Tier 1.
func (ac *AdminController) ListPendingVerificationsHandler(w http.ResponseWriter, r *http.Request) {
	filter := bson.M{
		"verification_status": "pending_nid",
		"tier":                1,
	}

	cursor, err := ac.UserCollection.Find(r.Context(), filter)
	if err != nil {
		http.Error(w, `{"error": "failed to query pending verifications"}`, http.StatusInternalServerError)
		return
	}
	defer cursor.Close(r.Context())

	var users []models.User
	if err := cursor.All(r.Context(), &users); err != nil {
		http.Error(w, `{"error": "failed to decode users"}`, http.StatusInternalServerError)
		return
	}

	if users == nil {
		users = []models.User{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// ApproveNIDHandler sets user to Tier 3 and verified status.
func (ac *AdminController) ApproveNIDHandler(w http.ResponseWriter, r *http.Request) {
	var req UserIDRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "invalid request body"}`, http.StatusBadRequest)
		return
	}

	userID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		http.Error(w, `{"error": "invalid user_id format"}`, http.StatusBadRequest)
		return
	}

	filter := bson.M{"_id": userID}
	update := bson.M{
		"$set": bson.M{
			"tier":                3,
			"verified":            true,
			"verification_status": "verified",
		},
	}

	_, err = ac.UserCollection.UpdateOne(r.Context(), filter, update)
	if err != nil {
		http.Error(w, `{"error": "failed to approve user"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "approved"})
}

// RejectNIDHandler resets user verification status to unverified.
func (ac *AdminController) RejectNIDHandler(w http.ResponseWriter, r *http.Request) {
	var req UserIDRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "invalid request body"}`, http.StatusBadRequest)
		return
	}

	userID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		http.Error(w, `{"error": "invalid user_id format"}`, http.StatusBadRequest)
		return
	}

	filter := bson.M{"_id": userID}
	update := bson.M{
		"$set": bson.M{
			"verification_status": "unverified",
		},
	}

	_, err = ac.UserCollection.UpdateOne(r.Context(), filter, update)
	if err != nil {
		http.Error(w, `{"error": "failed to reject user"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "rejected"})
}
