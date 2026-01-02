import pika
import json
import os
import time
import csv
import redis
import hashlib
import bisect

# --- Consistent Hash Implementation (From your provided code) ---
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
REDIS_NODES = os.getenv("REDIS_NODES", "redis://redis-1:6379,redis://redis-2:6379").split(",")

# Initialize Consistent Hash Ring
redis_ring = ConsistentHash(nodes=REDIS_NODES)
redis_clients = {node: redis.from_url(node) for node in REDIS_NODES}

def check_email_status(email):
    """
    O(1) Lookup using Redis + Consistent Hashing
    """
    node_url = redis_ring.get_node(email)
    r_client = redis_clients[node_url]
    
    # Check if bounced or subscribed
    # Using pipeline for efficiency if checking multiple, but here logic is singular for clarity
    is_bounced = r_client.sismember("bounced_emails", email)
    if is_bounced:
        return "BOUNCED"
        
    is_subscribed = r_client.sismember("subscribed_emails", email)
    if is_subscribed:
        return "SUBSCRIBED"
        
    return "VALID" # Default fallback (or further SMTP check)

def process_file(ch, method, properties, body):
    data = json.loads(body)
    file_path = data['file_path']
    job_id = data['job_id']
    
    print(f" [x] Processing Job {job_id}")
    
    results = []
    try:
        with open(file_path, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                email = row.get('email') or row.get('Email')
                if email:
                    status = check_email_status(email)
                    results.append({"email": email, "status": status})
        
        # Save results to DB (Batch insert recommended here)
        print(f" [x] Job {job_id} Completed. Processed {len(results)} emails.")
        
    except Exception as e:
        print(f" [!] Error processing file: {e}")
        # Update DB status to FAILED
        
    ch.basic_ack(delivery_tag=method.delivery_tag)

def start_worker():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()
    channel.queue_declare(queue='verification_tasks', durable=True)
    
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='verification_tasks', on_message_callback=process_file)
    
    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == "__main__":
    start_worker()