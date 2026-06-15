package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"maternal-neonatal-health/controllers"
	"maternal-neonatal-health/middleware"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

func main() {
	// 1. Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			log.Printf("Error disconnecting from MongoDB: %v", err)
		}
	}()

	if err := mongoClient.Ping(ctx, readpref.Primary()); err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}
	log.Println("Connected to MongoDB")

	db := mongoClient.Database("maternal_db")
	postCol := db.Collection("posts")
	commentCol := db.Collection("comments")
	userCol := db.Collection("users")
	otpCol := db.Collection("otps")
	childCol := db.Collection("children")

	// 2. Connect to RabbitMQ
	rmqConn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer rmqConn.Close()

	rmqChannel, err := rmqConn.Channel()
	if err != nil {
		log.Fatalf("Failed to open RabbitMQ channel: %v", err)
	}
	defer rmqChannel.Close()

	// Ensure the queue exists
	_, err = rmqChannel.QueueDeclare(
		"pii_stripper_queue", // name
		true,                 // durable
		false,                // delete when unused
		false,                // exclusive
		false,                // no-wait
		nil,                  // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare RabbitMQ queue: %v", err)
	}
	log.Println("Connected to RabbitMQ and queue declared")

	// 3. Initialize Controllers
	fc := &controllers.FeedController{
		PostCollection:    postCol,
		CommentCollection: commentCol,
		RabbitChannel:     rmqChannel,
	}

	ac := &controllers.AuthController{
		UserCollection:  userCol,
		OTPCollection:   otpCol,
		ChildCollection: childCol,
	}

	ad := &controllers.AdminController{
		UserCollection: userCol,
	}

	// 4. Register Routes
	mux := http.NewServeMux()

	// Simple auth middleware for demonstration purposes as handlers require userID in context
	authMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// In a real app, this would extract info from a JWT or session
			ctx := context.WithValue(r.Context(), "userID", "65f1a2b3c4d5e6f7a8b9c0d1")
			ctx = context.WithValue(ctx, "userName", "Jane Doe")
			ctx = context.WithValue(ctx, "userDistrict", "Central")
			ctx = context.WithValue(ctx, "userAvatarHue", 180)
			next.ServeHTTP(w, r.WithContext(ctx))
		}
	}

	// Feed Routes (Kept exactly as they are)
	mux.HandleFunc("POST /feed", authMiddleware(fc.CreatePostHandler))
	mux.HandleFunc("GET /feed", authMiddleware(fc.GetFeedHandler))
	mux.HandleFunc("POST /feed/like", authMiddleware(fc.ToggleLikeHandler))
	mux.HandleFunc("POST /feed/comment", authMiddleware(fc.CreateCommentHandler))

	// Auth Routes
	mux.HandleFunc("POST /auth/request-otp", ac.RequestOTPHandler)
	mux.HandleFunc("POST /auth/verify-otp", ac.VerifyOTPHandler)

	// User Onboarding (Protected by real JWT middleware)
	mux.Handle("POST /user/profile", middleware.RequireAuth(http.HandlerFunc(ac.CompleteProfileHandler)))
	mux.Handle("POST /user/verify/camera", middleware.RequireAuth(http.HandlerFunc(ac.CameraVerificationHandler)))
	mux.Handle("POST /user/verify/nid", middleware.RequireAuth(http.HandlerFunc(ac.NIDUploadHandler)))

	// Admin Routes (Protected by real JWT middleware)
	mux.Handle("GET /admin/verifications/pending", middleware.RequireAuth(http.HandlerFunc(ad.ListPendingVerificationsHandler)))
	mux.Handle("POST /admin/verifications/approve", middleware.RequireAuth(http.HandlerFunc(ad.ApproveNIDHandler)))
	mux.Handle("POST /admin/verifications/reject", middleware.RequireAuth(http.HandlerFunc(ad.RejectNIDHandler)))

	// Simple CORS middleware
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	// 5. Start HTTP Server
	server := &http.Server{
		Addr:    ":8080",
		Handler: corsMiddleware(mux),
	}

	// 6. Graceful Shutdown Logic
	go func() {
		log.Println("Starting server on :8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe failed: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Create a deadline for shutdown
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exiting")
}
