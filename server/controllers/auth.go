package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"maternal-neonatal-health/models"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var jwtSecret = []byte("momota-secret")

// AuthController handles authentication dependencies.
type AuthController struct {
	UserCollection  *mongo.Collection
	OTPCollection   *mongo.Collection
	ChildCollection *mongo.Collection
}

// RequestOTPRequest defines the body for OTP requests.
type RequestOTPRequest struct {
	Phone string `json:"phone"`
}

// RequestOTPHandler generates a 6-digit OTP and saves it.
func (ac *AuthController) RequestOTPHandler(w http.ResponseWriter, r *http.Request) {
	var req RequestOTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Phone == "" {
		http.Error(w, `{"error": "phone number is required"}`, http.StatusBadRequest)
		return
	}

	// Generate 6-digit code
	code := fmt.Sprintf("%06d", rand.Intn(1000000))

	otp := models.OTP{
		ID:        primitive.NewObjectID(),
		Phone:     req.Phone,
		Code:      code,
		ExpiresAt: time.Now().Add(5 * time.Minute),
	}

	// Upsert OTP for the phone number
	opts := options.Update().SetUpsert(true)
	filter := bson.M{"phone": req.Phone}
	update := bson.M{"$set": otp}

	_, err := ac.OTPCollection.UpdateOne(r.Context(), filter, update, opts)
	if err != nil {
		http.Error(w, `{"error": "failed to save otp"}`, http.StatusInternalServerError)
		return
	}

	// Mock SMS output
	fmt.Printf("\n[MOCK SMS] To: %s | Code: %s | Expires: 5m\n\n", req.Phone, code)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "otp sent"})
}

// VerifyOTPRequest defines the body for OTP verification.
type VerifyOTPRequest struct {
	Phone string `json:"phone"`
	Code  string `json:"code"`
}

// VerifyOTPResponse is returned upon successful login.
type VerifyOTPResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// VerifyOTPHandler validates the code and logs the user in.
func (ac *AuthController) VerifyOTPHandler(w http.ResponseWriter, r *http.Request) {
	var req VerifyOTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "invalid request body"}`, http.StatusBadRequest)
		return
	}

	// 1. Check OTP validity
	var otp models.OTP
	err := ac.OTPCollection.FindOne(r.Context(), bson.M{
		"phone":      req.Phone,
		"code":       req.Code,
		"expires_at": bson.M{"$gt": time.Now()},
	}).Decode(&otp)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, `{"error": "invalid or expired code"}`, http.StatusUnauthorized)
		} else {
			http.Error(w, `{"error": "database error"}`, http.StatusInternalServerError)
		}
		return
	}

	// 2. Consume OTP (Delete it)
	ac.OTPCollection.DeleteOne(r.Context(), bson.M{"_id": otp.ID})

	// 3. Find or Create User
	var user models.User
	err = ac.UserCollection.FindOne(r.Context(), bson.M{"phone": req.Phone}).Decode(&user)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			// New User Registration
			user = models.User{
				ID:        primitive.NewObjectID(),
				Phone:     req.Phone,
				Language:  "en",
				Tier:      1, // Guest
				Verified:  false,
				Banned:    false,
				CreatedAt: time.Now(),
			}
			_, err = ac.UserCollection.InsertOne(r.Context(), user)
			if err != nil {
				http.Error(w, `{"error": "failed to create user"}`, http.StatusInternalServerError)
				return
			}
		} else {
			http.Error(w, `{"error": "database error"}`, http.StatusInternalServerError)
			return
		}
	}

	// 4. Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": user.ID.Hex(),
		"tier":   user.Tier,
		"exp":    time.Now().Add(7 * 24 * time.Hour).Unix(), // 7 days
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		http.Error(w, `{"error": "failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(VerifyOTPResponse{
		Token: tokenString,
		User:  user,
	})
}

// CompleteProfileRequest defines the body for finishing profile setup.
type CompleteProfileRequest struct {
	Name     string    `json:"name"`
	District string    `json:"district"`
	Upazila  string    `json:"upazila"`
	Stage    string    `json:"stage"` // "pregnant" or "baby"
	Date     time.Time `json:"date"`
}

// CompleteProfileHandler updates user info and creates a child/pregnancy record.
func (ac *AuthController) CompleteProfileHandler(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		http.Error(w, `{"error": "invalid user id"}`, http.StatusBadRequest)
		return
	}

	var req CompleteProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "invalid request body"}`, http.StatusBadRequest)
		return
	}

	// 1. Update User Record
	update := bson.M{
		"$set": bson.M{
			"name":     req.Name,
			"district": req.District,
			"upazila":  req.Upazila,
		},
	}
	_, err = ac.UserCollection.UpdateOne(r.Context(), bson.M{"_id": userID}, update)
	if err != nil {
		http.Error(w, `{"error": "failed to update user profile"}`, http.StatusInternalServerError)
		return
	}

	// 2. Create Child Record
	child := models.Child{
		ID:     primitive.NewObjectID(),
		UserID: userID,
		Name:   "New Member", // Placeholder name
	}

	if req.Stage == "pregnant" {
		child.EDD = req.Date
	} else if req.Stage == "baby" {
		child.DOB = req.Date
	} else {
		http.Error(w, `{"error": "invalid stage value"}`, http.StatusBadRequest)
		return
	}

	_, err = ac.ChildCollection.InsertOne(r.Context(), child)
	if err != nil {
		http.Error(w, `{"error": "failed to create child profile"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "profile completed"})
}

// CameraVerificationHandler forwards webcam image to AI worker for gender verification.
func (ac *AuthController) CameraVerificationHandler(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		http.Error(w, `{"error": "invalid user id"}`, http.StatusBadRequest)
		return
	}

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, `{"error": "failed to parse form"}`, http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("webcam_image")
	if err != nil {
		http.Error(w, `{"error": "webcam_image required"}`, http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Prepare multipart request to Python worker
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("image", header.Filename)
	if err != nil {
		http.Error(w, `{"error": "failed to create form file"}`, http.StatusInternalServerError)
		return
	}
	if _, err := io.Copy(part, file); err != nil {
		http.Error(w, `{"error": "failed to copy file"}`, http.StatusInternalServerError)
		return
	}
	writer.Close()

	resp, err := http.Post("http://localhost:8006/verify-gender", writer.FormDataContentType(), body)
	if err != nil {
		log.Printf("Vision server connection error: %v", err)
		http.Error(w, `{"error": "failed to connect to verification service"}`, http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp struct {
			Detail interface{} `json:"detail"`
		}
		json.NewDecoder(resp.Body).Decode(&errResp)
		log.Printf("Vision server returned error %d: %v", resp.StatusCode, errResp.Detail)
		http.Error(w, `{"error": "verification service error"}`, http.StatusBadGateway)
		return
	}

	var result struct {
		Verified bool `json:"verified"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		http.Error(w, `{"error": "failed to parse verification response"}`, http.StatusInternalServerError)
		return
	}

	if !result.Verified {
		http.Error(w, `{"error": "gender verification failed: only women are allowed"}`, http.StatusForbidden)
		return
	}

	// Upgrade User to Tier 3
	update := bson.M{
		"$set": bson.M{
			"tier":                3,
			"verification_status": "verified",
			"verified":            true,
		},
	}
	_, err = ac.UserCollection.UpdateOne(r.Context(), bson.M{"_id": userID}, update)
	if err != nil {
		http.Error(w, `{"error": "failed to update user tier"}`, http.StatusInternalServerError)
		return
	}

	// Issue new JWT with Tier 3
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": userIDStr,
		"tier":   3,
		"exp":    time.Now().Add(7 * 24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		http.Error(w, `{"error": "failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "verified",
		"tier":   3,
		"token":  tokenString,
	})
}

// NIDUploadHandler saves NID image and sets status to pending_nid.
func (ac *AuthController) NIDUploadHandler(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		http.Error(w, `{"error": "invalid user id"}`, http.StatusBadRequest)
		return
	}

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, `{"error": "failed to parse form"}`, http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("nid_image")
	if err != nil {
		http.Error(w, `{"error": "nid_image required"}`, http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Ensure uploads directory exists
	uploadDir := "./uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.Mkdir(uploadDir, 0755)
	}

	// Save file locally
	filename := fmt.Sprintf("%s_%d%s", userIDStr, time.Now().Unix(), filepath.Ext(header.Filename))
	filePath := filepath.Join(uploadDir, filename)
	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, `{"error": "failed to save file"}`, http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, `{"error": "failed to copy file content"}`, http.StatusInternalServerError)
		return
	}

	// Update user status
	update := bson.M{"$set": bson.M{"verification_status": "pending_nid"}}
	_, err = ac.UserCollection.UpdateOne(r.Context(), bson.M{"_id": userID}, update)
	if err != nil {
		http.Error(w, `{"error": "failed to update status"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "pending_nid",
		"file":   filename,
	})
}
