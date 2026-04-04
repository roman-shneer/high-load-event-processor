# High-Load Event Processor (NestJS + RabbitMQ + PostgreSQL)

### 🚀 Senior Node.js Showcase Project
A production-ready microservice architecture designed to handle high-frequency analytical events with guaranteed delivery, rate limiting, and efficient data persistence — now with a **real-time React monitoring dashboard**.

---

## 🏗 Architecture Overview
This project demonstrates a classic **Event-Driven Architecture** to solve common high-load challenges:
*   **Traffic Spike Protection:** Uses RabbitMQ as a buffer between the API Gateway and the Database.
*   **Scalability:** The Gateway and Consumer can be scaled independently as separate Docker containers.
*   **Reliability:** Implements manual Acknowledgments (ack/nack) to ensure zero data loss during processing.
*   **Flexible Schema:** Leverages PostgreSQL JSONB for storing unstructured analytical payloads while maintaining SQL performance.

---

## 🛠 Tech Stack
*   **Backend:** Node.js, TypeScript, NestJS
*   **Message Broker:** RabbitMQ (using @nestjs/microservices)
*   **Database:** PostgreSQL (TypeORM)
*   **Monitoring Dashboard:** React (real-time via Server-Sent Events)
*   **Infrastructure:** Docker, Docker Compose
*   **Caching/Rate Limiting:** Redis

---

## 💎 Key Engineering Features

*   **Distributed Rate Limiting:** Implemented via **Redis** and `ThrottlerGuard` to prevent API abuse and ensure system stability across multiple service instances.
*   **Event-Driven Architecture:** Decoupled API Gateway from the Database using **RabbitMQ**, allowing the system to handle massive traffic spikes without data loss.
*   **Manual RMQ Acknowledgments:** Configured manual `ack/nack` strategy to guarantee that messages are only removed from the queue after successful DB persistence.
*   **PostgreSQL JSONB Optimization:** Specialized schema using `jsonb` for analytical payloads, combining the flexibility of NoSQL with the reliability of SQL.
*   **Strict Type Safety:** 100% TypeScript coverage with automated DTO validation via `class-validator` and `ValidationPipe`.
*   **Resilient Infrastructure:** Multi-stage Docker builds and automated health checks to ensure reliable service orchestration.
*   **Real-Time React Dashboard:** Live monitoring of RabbitMQ, PostgreSQL, and Application performance via **Server-Sent Events (SSE)** — with browser-triggered load tests.

---

## 🚦 Getting Started

### Prerequisites
*   Docker & Docker Compose

### Installation & Launch
```bash
# 1. Clone the repository
git clone https://github.com/roman-shneer/high-load-event-processor
cd high-load-event-processor

# 2. Spin up the entire infrastructure
docker-compose up --build
```

### Access Points

| Service | URL |
|---------|-----|
| **React Dashboard & API Gateway** | http://127.0.0.1:3000 |
| **RabbitMQ Management** | http://127.0.0.1:15672 (guest/guest) |
| **Grafana** | http://127.0.0.1:3001 (admin/admin) |
| **PostgreSQL** | port 5432 (DBeaver/pgAdmin) |

---

## 🧪 Testing the Pipeline

Send a Tracking Event

```bash
curl -X POST http://127.0.0.1:3000/events/track \
     -H "Content-Type: application/json" \
     -d '{
       "sessionId": "550e8400-e29b-41d4-a716-446655440000",
       "eventType": "product_view",
       "payload": { "productId": 123, "price": 99.99 },
       "timestamp": "2024-05-20T10:00:00Z"
     }'
```

<img width="720" height="464" alt="image" src="https://github.com/user-attachments/assets/c6b324c8-774b-4b47-bada-bd6f882947cc" />

---

## 📊 React Monitoring Dashboard

A real-time dashboard built with React that streams live metrics from the NestJS backend via **Server-Sent Events (SSE)** — a single persistent HTTP connection that pushes updates every second without polling overhead.

**Live Charts:**
*   **RabbitMQ Performance** — messages/sec throughput in real-time
*   **PostgreSQL Performance** — DB write speed and queue depth
*   **Application Performance** — end-to-end latency across the pipeline

**Load Testing Controls (browser-triggered):**
*   **Insert 1M** — inserts 1,000,000 events to stress-test the pipeline
*   **Stress Test** — simulates high-concurrency traffic spikes
*   Live status indicator shows test progress in real-time

<img width="820" height="1094" alt="image" src="https://github.com/user-attachments/assets/949c7f08-6e4e-4664-9f42-d5c9ea3e9707" />

---

## Performance test

artillery run performance/main.yml

<img width="834" height="758" alt="image" src="https://github.com/user-attachments/assets/cc6e5580-c2c2-40c6-b3af-e4b0eea53c58" />

artillery run performance/insert1m.yml

<img width="818" height="920" alt="image" src="https://github.com/user-attachments/assets/68d5b8f9-15a5-4401-ad4e-44b84dc9b1f8" />

---

### Monitoring

RabbitMQ Management: http://127.0.0.1:15672 (guest/guest)

Postgres: Connect via DBeaver/pgAdmin on port 5432

#### Graphana

http://127.0.0.1:3001/
Add connection http://prometheus:9090

user: admin

password: admin

Import graphana_dashboard.json

<img width="1518" height="744" alt="image" src="https://github.com/user-attachments/assets/b563d5a9-d711-4526-9477-553b20992e1b" />

---

## License

MIT License
