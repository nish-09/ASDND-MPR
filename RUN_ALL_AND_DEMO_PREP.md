# QueueLess — Autonomous Demo Execution & Practical Viva Runbook
> **INSTRUCTION FOR AI ASSISTANT / AGENT:**  
> When the user provides this file and says **"run"**, **"start"**, or **"execute"**, execute all of the following steps immediately without asking questions:
> 1. Run backend unit tests (`cd backend && npm test`) to confirm the Quality Gate passes (24 tests).
> 2. Start the Backend API server (`cd backend && npm run dev`) as a background daemon process on port 3000.
> 3. Start the Frontend Vite server (`cd frontend && npm run dev`) as a background daemon process on port 5173.
> 4. Verify HTTP `http://localhost:3000/health` and `http://localhost:3000/metrics`.
> 5. Present the user with the ready-to-speak Presentation Guide, Click Flow, and Viva Cheat Sheet below.

---

## ⚡ 1. Autonomous Execution Script (What AI Runs)

If executing via terminal / AI tool:

```powershell
# Step 1: Execute Automated Unit Tests (Quality Gate)
cd backend; npm test

# Step 2: Launch Backend API (Port 3000) in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Step 3: Launch Frontend Web (Port 5173) in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# Step 4: Open Demo Web App in Browser
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
```

*(Alternatively, user can double-click `start-all.bat` or run `.\scripts\start-all.ps1`)*

---

## 🌐 2. Live Service Endpoints

| Service | URL | Expected Response |
|---|---|---|
| **Frontend Web App** | `http://localhost:5173` | QueueLess portal UI (Browse providers, Login, Dashboard) |
| **Backend REST API** | `http://localhost:3000/api/v1` | Express API endpoints |
| **Health Check** | `http://localhost:3000/health` | `{"status":"ok","db":"connected"}` |
| **Prometheus Metrics** | `http://localhost:3000/metrics` | Real-time text-format Prometheus runtime metrics |

---

## 🔑 3. Pre-Seeded Demo Login Credentials

All accounts are pre-seeded in the database with password: `password123`

| Role | Email | Password | What to Demonstrate on Screen |
|---|---|---|---|
| **Customer** | `customer1@example.com` | `password123` | **"My Appointments"**: Click "Check In", receive instant token `D-001`, position #1, ETA 15 mins |
| **Clinic Staff** | `staff1@smithclinic.com` | `password123` | **"Staff Dashboard"**: View live waiting queue, click "Call Next", "Start Service", "Complete" |
| **Bank Staff** | `staff1@citybank.com` | `password123` | **Multi-Tenant Isolation**: Shows City Apex Bank queue, isolated from clinic queue |
| **Admin** | `admin@queueless.com` | `password123` | Full system access & oversight |

---

## 🎬 4. The 3-Minute Practical Presentation Flow

Follow this exact order when presenting to your professor:

### Step 1: The Problem & Live Solution (1 minute)
- **Action:** Open `http://localhost:5173`. Log in as Customer `customer1@example.com`.
- **Show:** Go to **My Appointments** $\rightarrow$ Click **Check In**. Token `D-001` appears with Position #1 and ETA 15 mins.
- **Action:** Open Incognito window. Log in as Staff `staff1@smithclinic.com`.
- **Show:** Go to **Staff Dashboard** $\rightarrow$ Click **Call Next** (Customer status becomes `CALLED`) $\rightarrow$ Click **Start Service** $\rightarrow$ Click **Complete**.
- **Speak:** *"QueueLess is a cloud-native virtual appointment and queue dispatching platform. Customers check in digitally and receive sequential tokens with live wait times, while staff counters call and serve patients without physical lines."*

---

### Step 2: Automated Testing / QA Experiment (30 seconds)
- **Action:** In terminal, run: `cd backend; npm test`
- **Show:** `24 passed, 24 total` across `queue.test.ts`, `authenticate.test.ts`, and `authorize.test.ts`.
- **Speak:** *"For our QA experiment, we automated unit testing using Jest. 24 test cases validate JWT security, RBAC authorization guards, and queue state machine transitions."*

---

### Step 3: Git & Version Control Experiment (30 seconds)
- **Action:** In terminal, run:
  ```powershell
  git branch -a
  git log --oneline --graph -n 6
  ```
- **Show:** Clean history with branches `main` and `feat/devops-mpr`, using conventional commits.
- **Speak:** *"For our VCS experiment, we used Git for distributed version control, using feature branches, atomic conventional commits, and remote synchronization with GitHub."*

---

### Step 4: Agile Scrum & Jira Experiment (30 seconds)
- **Action:** Open `docs/jira-backlog.csv` and `docs/JIRA_EVIDENCE.md` in VS Code.
- **Show:** 3 Sprints, Epics, User Stories, Fibonacci story points (1 to 8), Acceptance Criteria, and Git commit links.
- **Speak:** *"We planned development in Jira using 2-week Agile Sprints. Every feature was specified as a User Story with Given-When-Then acceptance criteria tied to Git commits."*

---

### Step 5: Docker Containerization & Compose (30 seconds)
- **Action:** Open `docker-compose.yml` and `backend/Dockerfile`. Run: `docker compose config`
- **Show:** Multi-stage Alpine Dockerfile and the 5-container architecture (Frontend, Backend, PostgreSQL, Redis, Worker).
- **Speak:** *"We containerized the frontend and backend using multi-stage Alpine Dockerfiles, and orchestrated the 5 microservices using Docker Compose with internal networks and health checks."*

---

### Step 6: CI/CD & Observability (30 seconds)
- **Action:** Open `.github/workflows/ci.yml`, `Jenkinsfile`, and `http://localhost:3000/metrics`.
- **Show:** The GitHub Actions workflow, the 6-stage Jenkins declarative pipeline, and the Prometheus metrics stream.
- **Speak:** *"We automated CI with GitHub Actions, defined a 6-stage Jenkins deployment pipeline, and instrumented the Express API with `prom-client` to expose telemetry for Prometheus scraping."*

---

## 🎯 5. "What Experiment Did You Perform?" Ready Answers

| Experiment Asked | What You Say Directly | Exact File to Show | Terminal Command |
|---|---|---|---|
| **Git / Version Control** | *"I managed version history on feature branches using conventional commits and synchronized with GitHub."* | `.git`, `README.md` | `git log --oneline --graph -n 6` |
| **Agile / Jira** | *"I planned 3 Sprints in Jira with User Stories, Fibonacci story points, and Given-When-Then acceptance criteria."* | `docs/jira-backlog.csv`<br>`docs/JIRA_EVIDENCE.md` | Open CSV in VS Code |
| **Automated Testing** | *"I wrote 24 automated unit tests using Jest covering JWT verification, RBAC permissions, and the queue state machine."* | `backend/tests/unit/` | `cd backend; npm test` |
| **Docker Packaging** | *"I containerized the backend and frontend using multi-stage Dockerfiles on Alpine Linux for minimal image size."* | `backend/Dockerfile`<br>`frontend/Dockerfile` | `docker images` |
| **Docker Compose** | *"I orchestrated a 5-tier architecture: Frontend, Backend, PostgreSQL, Redis, and Worker on an isolated bridge network."* | `docker-compose.yml` | `docker compose config` |
| **Continuous Integration** | *"I designed a GitHub Actions workflow that automatically tests, lints, and verifies Docker image builds on every push."* | `.github/workflows/ci.yml` | Open in VS Code |
| **Jenkins CI/CD** | *"I configured a 6-stage declarative Jenkins pipeline enforcing a test quality gate before Docker build and deployment."* | `Jenkinsfile` | Open in VS Code |
| **Monitoring** | *"I instrumented the API with `prom-client` to expose CPU, memory, and HTTP metrics at `/metrics` scraped by Prometheus."* | `backend/src/app.ts`<br>`monitoring/prometheus.yml` | Open `http://localhost:3000/metrics` |

---

## 💡 6. Viva Cheat Sheet (Quick Answers)

- **Container vs VM?**  
  *VM virtualizes entire hardware and OS (heavy, slow). Container virtualizes only the OS user space and shares the host kernel (lightweight, starts in milliseconds).*
- **Why multi-stage Dockerfile?**  
  *Stage 1 compiles TypeScript; Stage 2 takes only the compiled JavaScript and production dependencies, keeping the image small (<200MB) and secure.*
- **What is a Quality Gate?**  
  *A mandatory check in the CI/CD pipeline (e.g., unit test suite) that immediately halts the build if any test fails, preventing broken code from reaching production.*
- **Why PostgreSQL?**  
  *ACID compliance and row-level locking prevent double-booking appointment slots during concurrent requests.*
- **Why Redis & BullMQ?**  
  *Redis provides sub-millisecond in-memory caching and BullMQ offloads background asynchronous jobs (notifications, reminders, auto-canceling) without blocking HTTP threads.*
- **Prometheus vs Grafana?**  
  *Prometheus collects and stores time-series metric data via scraping. Grafana queries Prometheus to render interactive visualization dashboards.*
- **Where is Nagios?**  
  *Nagios is an older host-level monitoring tool. Our cloud-native microservices architecture uses Prometheus and Grafana, which is the current industry standard.*
