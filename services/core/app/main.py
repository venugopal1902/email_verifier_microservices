from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Header
from pydantic import BaseModel
import pika
import json
import os
import uuid
from typing import Optional

# Initialize FastAPI
app = FastAPI(title="Email Verifier Core Service")

# RabbitMQ Config
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_QUEUE = "verification_tasks"

# Dependency to get RabbitMQ Channel
def get_rabbitmq_channel():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()
    channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
    return channel, connection

# Security: Mock JWT Decoder (In prod, use PyJWT to decode and verify signature)
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Token")
    # Simplify: assume token contains user_id directly for this example
    # user_payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return {"user_id": 1, "username": "demo_user"} # Mocked

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "core-verification"}

@app.post("/api/verify/upload")
async def upload_file(
    file: UploadFile = File(...), 
    user: dict = Depends(get_current_user)
):
    """
    Accepts a CSV file, saves it, and pushes a job to RabbitMQ.
    """
    file_id = str(uuid.uuid4())
    file_location = f"/shared_data/{file_id}_{file.filename}"
    
    # 1. Save File to Disk (Shared Volume)
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    
    # 2. Save Metadata to DB (Pseudocode - Assume SQLAlchemy logic here)
    # db.add(UploadedFile(id=file_id, user_id=user['id'], status="QUEUED"))
    
    # 3. Push to RabbitMQ
    channel, connection = get_rabbitmq_channel()
    message = {
        "job_id": file_id,
        "user_id": user['user_id'],
        "file_path": file_location,
        "original_filename": file.filename
    }
    
    channel.basic_publish(
        exchange='',
        routing_key=RABBITMQ_QUEUE,
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,  # Make message persistent
        )
    )
    connection.close()
    
    return {"status": "queued", "job_id": file_id, "message": "File uploaded and processing started."}

@app.get("/api/verify/jobs/{job_id}")
def get_job_status(job_id: str):
    # Retrieve status from DB (Redis or Postgres)
    # status = db.query(UploadedFile).filter_by(id=job_id).first()
    return {"job_id": job_id, "status": "PROCESSING", "progress": "45%"}