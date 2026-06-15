import pika
import json
import time
import sys
import os
import re
from datetime import datetime
from pymongo import MongoClient
from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_anonymizer import AnonymizerEngine

# Configuration from GEMINI.md or Environment
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
QUEUE_NAME = 'pii_stripper_queue'

# Initialize MongoDB client
mongo_client = MongoClient(MONGO_URI)
db = mongo_client['maternal_db']
analytics_collection = db['analytics_data']

# Initialize Presidio engines
analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

# Custom recognizer for Bangladeshi Phone Numbers
bd_phone_pattern = Pattern(
    name="bd_phone_pattern",
    regex=r"(?:\+88|88)?01[3-9]\d{8}",
    score=0.8
)
bd_phone_recognizer = PatternRecognizer(
    supported_entity="PHONE_NUMBER",
    patterns=[bd_phone_pattern]
)
analyzer.registry.add_recognizer(bd_phone_recognizer)

def anonymize_text(raw_text):
    """
    Detects and redacts PERSON, LOCATION, and PHONE_NUMBER (including BD numbers).
    """
    if not raw_text:
        return ""

    # Analyze text for PII
    results = analyzer.analyze(
        text=raw_text,
        entities=["PERSON", "LOCATION", "PHONE_NUMBER"],
        language='en'
    )

    # Anonymize the detected PII
    anonymized_result = anonymizer.anonymize(
        text=raw_text,
        analyzer_results=results
    )

    return anonymized_result.text

def process_message(ch, method, properties, body):
    """
    Callback function to handle incoming RabbitMQ messages.
    """
    try:
        print(f" [x] Received message: {body.decode()}")
        
        # Parse JSON payload
        payload = json.loads(body)
        
        # Validate required fields from contract
        required_fields = ['post_id', 'text', 'cohort', 'district']
        for field in required_fields:
            if field not in payload:
                print(f" [!] Missing required field: {field}")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return

        # Log payload details
        original_post_id = payload['post_id']
        print(f" [i] Processing Post ID: {original_post_id}")
        
        # Anonymize PII in the text field
        anonymized_text = anonymize_text(payload['text'])
        
        # Prepare document for MongoDB Analytics Data Lake
        analytics_doc = {
            "original_post_id": original_post_id,
            "anonymized_text": anonymized_text,
            "cohort": payload['cohort'],
            "district": payload['district'],
            "processed_at": datetime.utcnow()
        }

        # Save to Analytics Data Lake
        analytics_collection.insert_one(analytics_doc)
        print(f" [v] Saved to Analytics Data Lake: {original_post_id}")

        # Acknowledge the message ONLY after successful DB insertion
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f" [v] Successfully processed and ACKed Post ID: {original_post_id}")

    except json.JSONDecodeError:
        print(" [!] Error: Failed to decode JSON payload.")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f" [!] Unexpected error: {e}")
        # Message is NOT ACKed here, allowing for requeue/re-processing
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

def main():
    """
    Main loop with connection retry logic.
    """
    while True:
        try:
            print(f" [*] Connecting to RabbitMQ at {RABBITMQ_HOST}...")
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=RABBITMQ_HOST)
            )
            channel = connection.channel()

            # Declare the queue
            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            
            # Set up consumer
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_message)

            print(f" [*] Waiting for messages in '{QUEUE_NAME}'. To exit press CTRL+C")
            channel.start_consuming()

        except pika.exceptions.AMQPConnectionError:
            print(" [!] Connection failed. Retrying in 5 seconds...")
            time.sleep(5)
        except KeyboardInterrupt:
            print(" [x] Stopping worker...")
            if 'connection' in locals() and connection.is_open:
                connection.close()
            sys.exit(0)
        except Exception as e:
            print(f" [!] Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
