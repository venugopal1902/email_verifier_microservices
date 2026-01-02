import pika
import json
import os
import time
import csv
import redis
import hashlib
import bisect
import sys

# --- Consistent Hash Implementation ---
class ConsistentHash:
    def __init__(self, nodes=None, replicas=3):
        self.replicas = replicas
        self.ring = dict()
        self.sorted_keys = []
        if nodes:
            for node in nodes:
                self.add_node(node)

    def add_node(self, node):
        for i in range(self.replicas):
            key = self.hash(f"{node}:{i}")
            self.ring[key] = node
            bisect.insort(self.sorted_keys, key)

    def get_node(self, string_key):
        if not self.ring:
            return None
        key = self.hash(string_key)
        idx = bisect.bisect(self.sorted_keys, key)
        if idx == len(self.sorted_keys):
            idx = 0
        return self.ring[self.sorted_keys[idx]]

    def hash(self, key):
        return int(hashlib.md5(key.encode('utf-8')).hexdigest(), 16)

# --- Worker Logic ---

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
# Default to a safe redis url if env var is missing or empty
REDIS_NODES_ENV = os.getenv("REDIS_NODES", "redis://redis:6379")
REDIS_NODES = REDIS_NODES_ENV.split(",") if REDIS_NODES_ENV else []

# Initialize Consistent Hash Ring (Handle case with no nodes gracefully)
if REDIS_NODES:
    redis_ring = ConsistentHash(nodes=REDIS_NODES)
    # Use a dictionary to store redis clients, lazy initialization could be better but this is fine for now
    redis_clients = {}
    for node in REDIS_NODES:
        try:
             redis_clients[node] = redis.from_url(node)
        except Exception as e:
            print(f" [!] Warning: Could not connect to Redis node {node}: {e}")
else:
    print(" [!] Warning: No REDIS_NODES configured.")
    redis_ring = None
    redis_clients = {}


def check_email_status(email):
    """
    O(1) Lookup using Redis + Consistent Hashing
    """
    if not redis_ring:
        return "UNKNOWN" # Redis not configured

    node_url = redis_ring.get_node(email)
    if not node_url or node_url not in redis_clients:
        return "UNKNOWN"

    r_client = redis_clients[node_url]
    
    try:
        # Check if bounced or subscribed
        is_bounced = r_client.sismember("bounced_emails", email)
        if is_bounced:
            return "BOUNCED"
            
        is_subscribed = r_client.sismember("subscribed_emails", email)
        if is_subscribed:
            return "SUBSCRIBED"
    except Exception as e:
        print(f" [!] Redis Error checking {email}: {e}")
        return "ERROR"
        
    return "VALID" 

def process_file(ch, method, properties, body):
    try:
        data = json.loads(body)
        file_path = data.get('file_path')
        job_id = data.get('job_id')
        
        print(f" [x] Processing Job {job_id}")
        
        results = []
        if file_path and os.path.exists(file_path):
            with open(file_path, 'r') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    # Handle different CSV header variations
                    email = row.get('email') or row.get('Email') or row.get('EMAIL')
                    if email:
                        status = check_email_status(email)
                        results.append({"email": email, "status": status})
            
            # TODO: Save results to DB (Batch insert recommended here)
            print(f" [x] Job {job_id} Completed. Processed {len(results)} emails.")
        else:
             print(f" [!] File not found: {file_path}")

    except Exception as e:
        print(f" [!] Error processing file: {e}")
        # Update DB status to FAILED
        
    # Acknowledge message even if failed to prevent infinite loop of bad message
    ch.basic_ack(delivery_tag=method.delivery_tag)

def get_rabbitmq_connection():
    """Retry connection to RabbitMQ until successful"""
    while True:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
            return connection
        except pika.exceptions.AMQPConnectionError:
            print(" [!] RabbitMQ not ready. Retrying in 5 seconds...")
            time.sleep(5)

def start_worker():
    connection = get_rabbitmq_connection()
    channel = connection.channel()
    channel.queue_declare(queue='verification_tasks', durable=True)
    
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='verification_tasks', on_message_callback=process_file)
    
    print(' [*] Waiting for messages. To exit press CTRL+C')
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        channel.stop_consuming()
    except Exception as e:
        print(f" [!] Connection lost: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    # Flush stdout to see logs in Docker immediately
    sys.stdout.flush()
    start_worker()