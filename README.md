# Experiences Marketplace API

A production-style backend API for an experiences marketplace where users can browse and book experiences, hosts can create them, and admins can moderate content.

---

## 🏗️ Architecture

Routes → Controllers → Services → Database

* **Routes**: Define endpoints
* **Controllers**: Handle HTTP request/response
* **Services**: Business logic
* **Database**: PostgreSQL with constraints and indexes

---

## ⚙️ Tech Stack

* Node.js + Express + TypeScript
* PostgreSQL with strategic indexes
* JWT + bcrypt for authentication
* Zod for validation
* Observability (logging + health checks)

---

## 🚀 Setup Instructions

### Prerequisites

* Node.js 18+
* PostgreSQL 14+

### Installation

```bash
git clone <repo-url>
cd experiences-marketplace
npm install
cp .env.example .env
# Update .env with your database credentials
psql -d your_database -f src/db/schema.sql
npm run dev
```

---

## 🔑 Environment Variables

| Variable       | Description                      |
| -------------- | -------------------------------- |
| PORT           | Server port (default 3000)       |
| DATABASE_URL   | PostgreSQL connection string     |
| JWT_SECRET     | Secret for JWT signing           |
| JWT_EXPIRES_IN | Token expiry (7d)                |
| BCRYPT_ROUNDS  | Salt rounds for password hashing |

---

## 📡 API Documentation

### 🔐 Authentication

| Method | Endpoint         | Description        |
| ------ | ---------------- | ------------------ |
| POST   | /api/auth/signup | Register user/host |
| POST   | /api/auth/login  | Login → JWT token  |

---

### 🎯 Experiences

| Method | Endpoint                     | Auth        | Description                |
| ------ | ---------------------------- | ----------- | -------------------------- |
| GET    | /api/experiences             | ❌           | List published experiences |
| POST   | /api/experiences             | host/admin  | Create experience          |
| PATCH  | /api/experiences/:id/publish | owner/admin | Publish experience         |
| PATCH  | /api/experiences/:id/block   | admin       | Block experience           |

---

### 🎟️ Bookings

| Method | Endpoint                  | Auth | Description         |
| ------ | ------------------------- | ---- | ------------------- |
| POST   | /api/experiences/:id/book | user | Book an experience  |
| GET    | /api/bookings             | user | Get user's bookings |

---

## 🧪 Example cURL Requests

### 🔐 Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"123456","role":"user"}'
```

### 🔐 Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"123456"}'
```

### 🎯 Create Experience (Host/Admin)

```bash
curl -X POST http://localhost:3000/api/experiences \
-H "Authorization: Bearer <host_token>" \
-H "Content-Type: application/json" \
-d '{"title":"Yoga","location":"Goa","price":500,"start_time":"2026-05-01T10:00:00Z"}'
```

### 🚀 Publish Experience

```bash
curl -X PATCH http://localhost:3000/api/experiences/1/publish \
-H "Authorization: Bearer <host_or_admin_token>"
```

### 🚫 Block Experience (Admin)

```bash
curl -X PATCH http://localhost:3000/api/experiences/1/block \
-H "Authorization: Bearer <admin_token>"
```

### 🌍 List Published Experiences

```bash
curl -X GET "http://localhost:3000/api/experiences?page=1&limit=10&sort=asc"
```

### 🎟️ Book Experience

```bash
curl -X POST http://localhost:3000/api/experiences/1/book \
-H "Authorization: Bearer <user_token>" \
-H "Content-Type: application/json" \
-d '{"seats":2}'
```

---

## 🧠 RBAC Rules Implemented

* Only **user or host** can signup (admin cannot self-assign)
* **host and admin** can create experiences
* Only **owner host or admin** can publish experiences
* Only **admin** can block experiences
* Only **user** can book experiences
* **Host cannot book their own experiences**

---

## ⚠️ Edge Cases Handled

* Duplicate email → **409 Conflict**
* Invalid ID format → **400 Bad Request**
* Book unpublished experience → **400 Bad Request**
* Duplicate confirmed booking → **409 Conflict (partial unique index)**
* Non-owner publish → **403 Forbidden**
* Non-admin block → **403 Forbidden**
* Missing JWT → **401 Unauthorized**
* Invalid token → **401 Unauthorized**

---

## ⚡ Indexing Strategy

| Index                                  | Purpose                               |
| -------------------------------------- | ------------------------------------- |
| idx_experiences_location_start_time    | Speeds up filtered public listing     |
| idx_experiences_status_start_time      | Fast published experience queries     |
| idx_bookings_user_experience           | Quick user booking history            |
| idx_unique_confirmed_booking (partial) | Prevents duplicate confirmed bookings |

---

## 🔐 Security Considerations

* Passwords hashed with bcrypt (10 rounds)
* JWT includes `sub` (standard claim) and role
* Environment validation on startup (fail-fast)
* ID parameter validation (prevents NaN injection)
* `requireOwnerOrAdmin` middleware prevents IDOR
* Parameterized queries prevent SQL injection

---

## ⚡ Performance Optimizations

* Database indexes on filtered/joined columns
* Connection pooling (max 20 connections)
* Pagination with page/limit (max 100 per page)
* Partial unique index for concurrency safety

---

## 🏭 Production Improvements (Future)

* Rate limiting on auth endpoints
* Refresh token rotation
* Structured logging (Pino/Winston)
* API versioning (/api/v1)
* Seat capacity in experiences table

---

## 🧠 Design Philosophy

This project was built with a **production-first mindset**:

* Focused on correctness, security, and strict RBAC enforcement
* Avoided over-engineering beyond assignment scope
* Used database constraints (partial unique index) for data integrity
* Designed architecture to scale easily

**Trade-offs:**

* Did not implement rate limiting, capacity management, or soft deletes due to time constraints
* These can be added without architectural changes

---

## 🤖 AI Usage Disclosure

Used AI for:

* Planning architecture and folder structure
* Generating boilerplate code
* Debugging edge cases and error handling
* Writing this README

All implementation and logic decisions were manually reviewed and verified.

---

## 📄 License

MIT
