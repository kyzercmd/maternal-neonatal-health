# Architectural Ground Rules

- Stack: Python 3.10+, `pika` (RabbitMQ), `pymongo` (MongoDB), `presidio-analyzer` (PII stripping).
- Role: Background worker. This is NOT a FastAPI endpoint. It is a standalone script that runs continuously to consume queue messages.
- Queue Name: `pii_stripper_queue`

# Payload Contract (From Golang)

Incoming RabbitMQ message is a JSON string:
{
"post_id": "string",
"text": "string",
"cohort": "string",
"district": "string"
}

# Database Target (Analytics Data Lake)

Database: `maternal_db`
Collection: `analytics_data`
Fields to save: `original_post_id`, `anonymized_text`, `cohort`, `district`, `processed_at`
