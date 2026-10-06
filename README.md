# QueueLess — Smart Real-Time Appointment & Queue Management System
> **MPR / ASD & DevOps Laboratory Project**  
> **Author:** Kaushal Patil  
> **Repository:** `https://github.com/nish-09/ASDND-MPR`

QueueLess is an enterprise-grade appointment booking and live queue dispatching web application designed to eliminate physical waiting lines in clinics, banks, DMV offices, and service centers.

---

## 🏗️ Architecture & Technology Stack

QueueLess is designed as a multi-tier cloud-native application:

```
┌─────────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite + TypeScript)      │
│               Port: 8080 (Docker) / 5173 (Dev)              │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST API (/api/v1)
┌──────────────────────────────▼──────────────────────────────┐
│          Backend API (Node.js + Express + TypeScript)       │
│          Port: 3000 | Metrics: /metrics | Health: /health  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│ PostgreSQL 15 (Prisma ORM)  ││       Redis 7 + BullMQ       │
│ Port: 5432                  ││       Port: 6379             │
│ Persistent Relational DB    ││       In-Memory & Background │
└─────────────────────────────┘└──────────────────────────────┘
```

- **Frontend:** React 19, TypeScript, Vite, Tailwind/Modern CSS, Lucide React, React Router DOM
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Zod, JWT dual tokens, bcrypt, Pino, Helmet, CORS
- **Database:** PostgreSQL (Neon Cloud / Local Docker)
- **Cache & Async:** Redis 7, BullMQ
- **DevOps Stack:** Git, Docker, Docker Compose, GitHub Actions, Jenkins, Prometheus, Grafana, Atlassian Jira

---

## 🧪 Laboratory Experiments Mapped

| Domain | Experiment Performed | Implementation in QueueLess | Key File / Artifact |
|---|---|---|---|
| **Version Control** | Git Workflow & History | Commits, feature branching, conventional commits | `.git`, `git log` |
| **Agile / Scrum** | Jira Project Tracking | Epics, Sprints, User Stories, Story Points | `docs/JIRA_EVIDENCE.md`, `docs/jira-backlog.csv` |
| **Testing / QA** | Automated Unit Testing | JWT auth, RBAC authorization, Queue state machine | `backend/tests/unit/*.test.ts` (24 passing tests) |
| **Containerization** | Docker Packaging | Multi-stage Dockerfiles for backend and frontend | `backend/Dockerfile`, `frontend/Dockerfile` |
| **Orchestration** | Multi-Container Stack | Frontend, Backend, PostgreSQL, Redis, Worker | `docker-compose.yml` |
| **CI Automation** | GitHub Actions Pipeline | Automated checkout, lint, test, build & docker check | `.github/workflows/ci.yml` |
| **CI/CD Pipeline** | Jenkins Automation | Declarative 6-stage pipeline (Build, Test, Deploy) | `Jenkinsfile` |
| **Observability** | Metrics & Monitoring | Prometheus metrics scraping & Grafana dashboard | `backend/src/app.ts`, `monitoring/prometheus.yml` |

---

## ⚡ Quick Start & Running the Project

### Option A: Local Development (Fastest for Viva)

1. **Install Dependencies:**
   ```bash
   npm run install:all
   ```

2. **Verify Database Connectivity:**
   ```bash
   cd backend
   node -r dotenv/config scripts/db-check.js
   ```

3. **Run Automated Unit Tests:**
   ```bash
   cd backend
   npm test
   ```

4. **Start Application:**
   - Terminal 1 (Backend):
     ```bash
     cd backend
     npm run dev
     ```
   - Terminal 2 (Frontend):
     ```bash
     cd frontend
     npm run dev
     ```
   - Open browser: `http://localhost:5173`

---

### Option B: Docker Multi-Container Stack

```bash
# Start all containers in background
docker compose up -d

# Check container status
docker compose ps

# View running container logs
docker compose logs -f backend
```
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000`
- Backend Health: `http://localhost:3000/health`
- Prometheus Metrics: `http://localhost:3000/metrics`

---

## 🔑 Demo Login Credentials

All accounts are pre-seeded with password: `password123`

| Role | Email | Password | What to demonstrate |
|---|---|---|---|
| **Customer** | `customer1@example.com` | `password123` | Browse providers, Book appointment, Check-in, View live token & ETA |
| **Staff** | `staff1@smithclinic.com` | `password123` | Staff Queue Dashboard: Call Next, Start Service, Complete, Skip |
| **Bank Staff** | `staff1@citybank.com` | `password123` | Multi-tenant isolation: Bank counter queue |
| **Admin** | `admin@queueless.com` | `password123` | System oversight & full access |

---

## 📊 Monitoring Stack (Prometheus & Grafana)

```bash
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```
- Prometheus UI: `http://localhost:9090`
- Grafana Dashboard: `http://localhost:3001` (user: `admin`, pass: `admin`)
- Raw Application Metrics: `http://localhost:3000/metrics`
