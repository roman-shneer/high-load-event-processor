# High-Load Event Processor (NestJS + RabbitMQ + PostgreSQL)



### 🚀 Senior Node.js Showcase Project
A production-ready microservice architecture designed to handle high-frequency analytical events with guaranteed delivery, rate limiting, and efficient data persistence.

---

## 🏗 Architecture Overview
This project demonstrates a classic **Event-Driven Architecture** to solve common high-load challenges:
*   **Traffic Spike Protection:** Uses RabbitMQ as a buffer between the API Gateway and the Database.
*   **Scalability:** The Gateway and Consumer can be scaled independently as separate Docker containers.
*   **Reliability:** Implements manual Acknowledgments (ack/nack) to ensure zero data loss during processing.
*   **Flexible Schema:** Leverages PostgreSQL JSONB for storing unstructured analytical payloads while maintaining SQL performance.


## 🛠 Tech Stack
*   **Backend:** Node.js, TypeScript, NestJS
*   **Message Broker:** RabbitMQ (using @nestjs/microservices)
*   **Database:** PostgreSQL (TypeORM)
*   **Infrastructure:** Docker, Docker Compose
*   **Caching/Rate Limiting:** Redis (ready for implementation)


## 💎 Key Engineering Features


*   **Validation Pipe:** Strict DTO validation with class-validator to ensure only clean data enters the pipeline.
*   **Manual RMQ Acknowledgments:** Prevents message loss if the Consumer or Database fails during processing.
*   **Multi-stage Docker Build:** Optimized Dockerfile for small and secure production images.
*   **Graceful Shutdown:** Handles system signals to close database and queue connections properly.


## 🚦 Getting Started

### Prerequisites
*   Docker & Docker Compose
### Installation & Launch
``` bash
# 1. Clone the repository
git clone https://github.com
cd high-load-event-processor

# 2. Spin up the entire infrastructure
docker-compose up --build 
```


### The API will be available at http://localhost:3000.
## 🧪 Testing the Pipeline

Send a Tracking Event
```
bash
curl -X POST http://localhost:3000/events/track \
     -H "Content-Type: application/json" \
     -d '{
       "sessionId": "550e8400-e29b-41d4-a716-446655440000",
       "eventType": "product_view",
       "payload": { "productId": 123, "price": 99.99 },
       "timestamp": "2024-05-20T10:00:00Z"
     }'
```

### Monitoring
RabbitMQ Management: http://localhost:15672 (guest/guest)

Postgres: Connect via DBeaver/pgAdmin on port 5432
