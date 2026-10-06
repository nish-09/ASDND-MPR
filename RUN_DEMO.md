# QueueLess — Complete Presentation Runbook & AI Execution Guide

> **DIRECTIVE FOR AI AGENT / ASSISTANT:**  
> When the user shares this file and says **"run"**, **"start"**, or **"execute"**, autonomously execute the following sequence immediately without asking clarifying questions:
> 1. Run unit test quality gate: `cd backend; npm test` (verify 24 tests pass).
> 2. Ensure database containers are up: `docker compose up -d postgres redis`.
> 3. Launch Backend API on port 3000 as a background daemon process (`cd backend; npm run dev`).
> 4. Launch Frontend Web on port 5173 as a background daemon process (`cd frontend; npm run dev`).
> 5. Verify endpoints: `http://localhost:3000/health` and `http://localhost:3000/metrics`.
> 6. Output the presentation walkthrough, demo accounts, and viva answers below to the user.

---

## ⚡ 1. Manual One-Line Run Command (If not using AI)

If running directly in PowerShell:
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"; Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"; Start-Sleep -Seconds 3; Start-Process "http://localhost:5173"
```

---

## 🌐 2. Live Services & Endpoints

| Service | Local URL | Role in Demo |
|---|---|---|
| **Frontend Web App** | `http://localhost:5173` | Main interactive UI for Customer and Staff |
| **Backend REST API** | `http://localhost:3000` | Express API handling business logic |
| **Health Check** | `http://localhost:3000/health` | Service health status (`{"status":"ok","db":"connected"}`) |
| **Prometheus Metrics** | `http://localhost:3000/metrics` | Real-time Prometheus telemetry |
| **Prometheus UI** | `http://localhost:9090` | Time-series metrics scraper (if container running) |
| **Grafana Dashboard** | `http://localhost:3001` | Visualization dashboard (`admin` / `admin`) |

---

## 🔑 3. Pre-Seeded Demo Login Credentials

All accounts are pre-seeded in the database with password: **`password123`**

| Role | Email | Password | What to Show on Screen |
|---|---|---|---|
| **Customer** | `customer1@example.com` | `password123` | **"My Appointments"**: Click "Check In", receive instant token `D-001`, position #1, ETA 15 mins |
| **Clinic Staff** | `staff1@smithclinic.com` | `password123` | **"Staff Dashboard"**: View live waiting queue, click "Call Next", "Start Service", "Complete" |
| **Bank Staff** | `staff1@citybank.com` | `password123` | **Multi-Tenant Isolation**: Shows Bank queue, completely isolated from clinic queue |
| **Admin** | `admin@queueless.com` | `password123` | System oversight & full access |

---

## 🎬 4. Practical Viva Presentation Flow (Step-by-Step)

### Step 1: Live Application Demonstration (1 minute)
- **Click:** Open `http://localhost:5173`. Log in as Customer `customer1@example.com`.
- **Show:** Go to **My Appointments** $\rightarrow$ Click **Check In**. Token appears with Position #1 and ETA.
- **Click:** Open Incognito window. Log in as Staff `staff1@smithclinic.com`.
- **Show:** Go to **Staff Dashboard** $\rightarrow$ Click **Call Next** (Customer status becomes `CALLED`) $\rightarrow$ Click **Start Service** $\rightarrow$ Click **Complete**.
- **Speak:** *"QueueLess eliminates physical queues. Customers check in digitally and receive sequential tokens with live wait times, while staff counters call and serve attendees through a state machine."*

### Step 2: Automated Unit Testing / QA Experiment (30 seconds)
- **Click:** In terminal: `cd backend; npm test`
- **Show:** 24 passing tests across `queue.test.ts`, `authenticate.test.ts`, and `authorize.test.ts`.
- **Speak:** *"For our QA experiment, we automated testing using Jest. 24 unit tests validate JWT authentication, RBAC authorization guards, and queue state machine transitions."*

### Step 3: Git Version Control Experiment (30 seconds)
- **Click:** In terminal:
  ```powershell
  git branch -a
  git log --oneline --graph -n 6
  ```
- **Show:** Structured history with branches `main` and feature branches, using conventional commits.
- **Speak:** *"We used Git for version control with feature branches, atomic conventional commits, and remote synchronization with GitHub."*

### Step 4: Agile Scrum & Jira Tracking Experiment (30 seconds)
- **Click:** Open `docs/jira-backlog.csv` and `docs/JIRA_EVIDENCE.md` in VS Code.
- **Show:** Epics, Sprints, User Stories, Fibonacci story points (1 to 8), Acceptance Criteria, and Git commits.
- **Speak:** *"We planned the project in Jira using 2-week Agile Sprints. Every feature was specified as a User Story with Given-When-Then acceptance criteria tied to Git commits."*

### Step 5: Docker Containerization & Compose (30 seconds)
- **Click:** Open `docker-compose.yml` and `backend/Dockerfile`. Run: `docker compose config`
- **Show:** Multi-stage Alpine Dockerfile and the 5-container architecture (Frontend, Backend, PostgreSQL, Redis, Worker).
- **Speak:** *"We containerized our services using multi-stage Alpine Dockerfiles for minimal image size, and orchestrated the 5 microservices using Docker Compose with internal networks and health checks."*

### Step 6: CI/CD & Observability (30 seconds)
- **Click:** Open `.github/workflows/ci.yml`, `Jenkinsfile`, and `http://localhost:3000/metrics`.
- **Show:** GitHub Actions workflow, 6-stage Jenkins pipeline, and Prometheus metrics endpoint.
- **Speak:** *"We automated CI with GitHub Actions, configured a 6-stage Jenkins pipeline with quality gates, and instrumented the Express API with `prom-client` to expose metrics for Prometheus."*

---

## 🎯 5. "What Experiment Did You Perform?" Ready Answers

| Experiment | What You Say Directly | Exact File to Show | Terminal Command |
|---|---|---|---|
| **Git / Version Control** | *"I managed version history on feature branches using conventional commits and synchronized with GitHub."* | `.git`, `README.md` | `git log --oneline --graph -n 6` |
| **Agile / Jira** | *"I planned 3 Sprints in Jira with User Stories, Fibonacci story points, and Given-When-Then acceptance criteria."* | `docs/jira-backlog.csv`<br>`docs/JIRA_EVIDENCE.md` | Open CSV in editor |
| **Automated Testing** | *"I wrote 24 automated unit tests using Jest covering JWT verification, RBAC permissions, and the queue state machine."* | `backend/tests/unit/` | `cd backend; npm test` |
| **Docker Packaging** | *"I containerized backend and frontend using multi-stage Dockerfiles on Alpine Linux for minimal image size."* | `backend/Dockerfile`<br>`frontend/Dockerfile` | `docker images` |
| **Docker Compose** | *"I orchestrated a 5-tier architecture: Frontend, Backend, PostgreSQL, Redis, and Worker on an isolated bridge network."* | `docker-compose.yml` | `docker compose config` |
| **Continuous Integration** | *"I designed a GitHub Actions workflow that automatically tests, lints, and verifies Docker image builds on every push."* | `.github/workflows/ci.yml` | Open in editor |
| **Jenkins CI/CD** | *"I configured a 6-stage declarative Jenkins pipeline enforcing a test quality gate before Docker build and deployment."* | `Jenkinsfile` | Open in editor |
| **Monitoring** | *"I instrumented the API with `prom-client` to expose CPU, memory, and HTTP metrics at `/metrics` scraped by Prometheus."* | `backend/src/app.ts`<br>`monitoring/prometheus.yml` | Open `http://localhost:3000/metrics` |

---

## 💡 6. Viva Cheat Sheet (Quick Answers)

- **Container vs VM?**  
  *VM virtualizes entire hardware and OS (heavy, slow). Container virtualizes only the OS user space and shares the host kernel (lightweight, starts in milliseconds).*
- **Why multi-stage Dockerfile?**  
  *Stage 1 compiles TypeScript; Stage 2 takes only compiled JS and production dependencies, keeping the image small (<200MB) and secure.*
- **What is a Quality Gate?**  
  *A mandatory check in the CI/CD pipeline (e.g. unit tests) that halts the build if any test fails, preventing broken code from deploying.*
- **Why PostgreSQL?**  
  *ACID compliance and row-level locking prevent double-booking appointment slots during concurrent requests.*
- **Why Redis & BullMQ?**  
  *Redis provides sub-millisecond in-memory caching and BullMQ offloads background asynchronous jobs without blocking HTTP threads.*
- **Prometheus vs Grafana?**  
  *Prometheus collects and stores time-series metric data via scraping. Grafana queries Prometheus to render interactive visualization dashboards.*
- **Where is Nagios?**  
  *Nagios is an older host-level monitoring tool. Our cloud-native microservices architecture uses Prometheus and Grafana, which is the current industry standard.*
