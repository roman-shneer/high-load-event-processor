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

*   **Distributed Rate Limiting:** Implemented via **Redis** and `ThrottlerGuard` to prevent API abuse and ensure system stability across multiple service instances.
*   **Event-Driven Architecture:** Decoupled API Gateway from the Database using **RabbitMQ**, allowing the system to handle massive traffic spikes without data loss.
*   **Manual RMQ Acknowledgments:** Configured manual `ack/nack` strategy to guarantee that messages are only removed from the queue after successful DB persistence.
*   **PostgreSQL JSONB Optimization:** Specialized schema using `jsonb` for analytical payloads, combining the flexibility of NoSQL with the reliability of SQL.
*   **Strict Type Safety:** 100% TypeScript coverage with automated DTO validation via `class-validator` and `ValidationPipe`.
*   **Resilient Infrastructure:** Multi-stage Docker builds and automated health checks to ensure reliable service orchestration.


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


### The API will be available at http://127.0.0.1:3000.
## 🧪 Testing the Pipeline

Send a Tracking Event
```
bash
curl -X POST http://127.0.0.1:3000/events/track \
     -H "Content-Type: application/json" \
     -d '{
       "sessionId": "550e8400-e29b-41d4-a716-446655440000",
       "eventType": "product_view",
       "payload": { "productId": 123, "price": 99.99 },
       "timestamp": "2024-05-20T10:00:00Z"
     }'
```

<img width="738" height="331" alt="image" src="https://github.com/user-attachments/assets/48f39d91-5c20-4bbf-92a4-82a474b87600" />


### Monitoring
RabbitMQ Management: http://127.0.0.1:15672 (guest/guest)

Postgres: Connect via DBeaver/pgAdmin on port 5432

## Graphana

http://127.0.0.1:3001/

user:admin
password:admin
Import graphana_dashboard.json

## Perfomance test
artillery run perfomance/main.yml

artillery run perfomance/insert1m.yml