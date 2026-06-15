# Architectural Ground Rules

- Stack: Golang, MongoDB (official `go.mongodb.org/mongo-driver`), RabbitMQ (`github.com/rabbitmq/amqp091-go`)
- Absolute standard for errors: Return proper HTTP status codes and JSON error objects: `{"error": "message"}`
- User identity: Extracted from a verified JWT auth middleware as a string variable `userID` inside `r.Context()`.

# Module 1: Community Feed

Implements the cohort aggregation pipeline, posting loop, likes, and comment system.

## Database Collection Schema Mapping

### Collection: `posts`

- `_id`: primitive.ObjectID (Maps to frontend `id`)
- `author_id`: primitive.ObjectID (Who wrote it)
- `author_name`: string (For denormalized quick rendering)
- `author_district`: string (e.g., "সিলেট")
- `author_avatar_hue`: int (Frontend avatar styling)
- `cohort`: string (Enum values: "pregnancy", "0-6m", "6-12m", "1-2y", "2-5y")
- `text`: string (The body content)
- `images`: array of strings (Cloud URLs)
- `likes`: array of primitive.ObjectID (Contains IDs of users who liked it)
- `created_at`: time.Time

### Collection: `comments`

- `_id`: primitive.ObjectID
- `post_id`: primitive.ObjectID (Indexed)
- `author_id`: primitive.ObjectID
- `author_name`: string
- `author_district`: string
- `author_avatar_hue`: int
- `text`: string
- `likes`: array of primitive.ObjectID
- `created_at`: time.Time

# Module 2: Auth & Onboarding

Implements mobile OTP login, progressive profile completion, and Tier 3 verification.

## Database Collection Schema Mapping

### Collection: `users`

- `_id`: primitive.ObjectID (Maps to frontend `id`)
- `phone`: string (Unique, e.g., "+8801...")
- `name`: string
- `avatar_url`: string
- `district`: string
- `upazila`: string
- `language`: string (Default: "en")
- `tier`: int (1 = Guest, 2 = Trust Network, 3 = Verified)
- `verified`: bool
- `banned`: bool
- `created_at`: time.Time

### Collection: `children`

- `_id`: primitive.ObjectID
- `user_id`: primitive.ObjectID (Indexed reference to User)
- `name`: string
- `dob`: time.Time (Parsed from ISODate)
- `edd`: time.Time (Parsed from ISODate)
- `sex`: string
- `birth_weight_kg`: float64
- `feeding`: string
- `allergies`: string

### Collection: `otps`

- `_id`: primitive.ObjectID
- `phone`: string
- `code`: string (6-digit string)
- `expires_at`: time.Time (Used for MongoDB TTL index)

## Auth Rules

- Use `github.com/golang-jwt/jwt/v5` for JWT tokens.
- The JWT claims must include `userID` and `tier`.
- Routes modifying the profile or accessing the feed require a JWT middleware.

## Auth Status Lifecycle

- `verification_status` Enums: "unverified", "pending_nid", "verified"
- Admin role checking: Handled via the user's role field (or token claims). Only `role == "admin"` can access management routes.
