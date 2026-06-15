package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents the primary user/mother profile in the system.
type User struct {
	ID        primitive.ObjectID `bson:"_id" json:"id"`
	Phone     string             `bson:"phone" json:"phone"`
	Name      string             `bson:"name" json:"name"`
	AvatarURL string             `bson:"avatar_url" json:"avatar_url"`
	District  string             `bson:"district" json:"district"`
	Upazila   string             `bson:"upazila" json:"upazila"`
	Language           string             `bson:"language" json:"language"`
	Tier               int                `bson:"tier" json:"tier"`
	Verified           bool               `bson:"verified" json:"verified"`
	VerificationStatus string             `bson:"verification_status" json:"verification_status"`
	Banned             bool               `bson:"banned" json:"banned"`
	CreatedAt          time.Time          `bson:"created_at" json:"created_at"`
}

// Child represents a child linked to a mother (User).
type Child struct {
	ID            primitive.ObjectID `bson:"_id" json:"id"`
	UserID        primitive.ObjectID `bson:"user_id" json:"user_id"`
	Name          string             `bson:"name" json:"name"`
	DOB           time.Time          `bson:"dob" json:"dob"`
	EDD           time.Time          `bson:"edd" json:"edd"`
	Sex           string             `bson:"sex" json:"sex"`
	BirthWeightKg float64            `bson:"birth_weight_kg" json:"birth_weight_kg"`
	Feeding       string             `bson:"feeding" json:"feeding"`
	Allergies     string             `bson:"allergies" json:"allergies"`
}

// MotherProfile stores progressive health and pregnancy data.
type MotherProfile struct {
	ID              primitive.ObjectID `bson:"_id" json:"id"`
	UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`
	LMP             time.Time          `bson:"lmp" json:"lmp"`
	EDD             time.Time          `bson:"edd" json:"edd"`
	WeightKg        float64            `bson:"weight_kg" json:"weight_kg"`
	BloodGroup      string             `bson:"blood_group" json:"blood_group"`
	PregnancyStatus string             `bson:"pregnancy_status" json:"pregnancy_status"`
	LastCheckup     time.Time          `bson:"last_checkup" json:"last_checkup"`
}

// OTP represents a temporary one-time password for login.
type OTP struct {
	ID        primitive.ObjectID `bson:"_id" json:"id"`
	Phone     string             `bson:"phone" json:"phone"`
	Code      string             `bson:"code" json:"code"`
	ExpiresAt time.Time          `bson:"expires_at" json:"expires_at"`
}
