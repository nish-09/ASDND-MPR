# 🚀 QueueLess — Complete DevOps Master Presentation Guide & Viva Defense Runbook

> **Project:** QueueLess — Multi-Tenant Virtual Queue & Appointment Telemetry System  
> **Course / Module:** Advanced Software Design & DevOps Practices (ASDND - MPR)  
> **Repository:** `ASDND-MPR`  
> **Technology Stack:** TypeScript, React (Vite), Express.js, PostgreSQL, Redis, Docker, Docker Compose, Prometheus, Grafana, GitHub Actions, Jenkins, Atlassian Jira, Jest.

---

## 📋 Table of Contents
1. [Architecture & DevOps Topology Overview](#1-architecture--devops-topology-overview)
2. [Pre-Flight Verification & Live Endpoints](#2-pre-flight-verification--live-endpoints)
3. [Step-by-Step Show & Tell Presentation Script](#3-step-by-step-show--tell-presentation-script)
   - [Phase 1: Project Introduction & Problem Statement (1 min)](#phase-1-project-introduction--problem-statement)
   - [Phase 2: Live Application Functional Demo (2 min)](#phase-2-live-application-functional-demo)
   - [Phase 3: Automated Testing & QA Quality Gate (1.5 min)](#phase-3-automated-testing--qa-quality-gate)
   - [Phase 4: Docker Containerization & Multi-Stage Builds (2 min)](#phase-4-docker-containerization--multi-stage-builds)
   - [Phase 5: Docker Compose Microservice Orchestration (2 min)](#phase-5-docker-compose-microservice-orchestration)
   - [Phase 6: Prometheus Time-Series Telemetry & Scraping (2 min)](#phase-6-prometheus-time-series-telemetry--scraping)
   - [Phase 7: Grafana Real-Time Observability Dashboard (2 min)](#phase-7-grafana-real-time-observability-dashboard)
   - [Phase 8: CI/CD Pipelines (GitHub Actions & Jenkins) (2 min)](#phase-8-cicd-pipelines-github-actions--jenkins)
   - [Phase 9: Agile Scrum & Jira Traceability (1.5 min)](#phase-9-agile-scrum--jira-traceability)
4. [Deep-Dive Viva & Examiner Defense Q&A](#4-deep-dive-viva--examiner-defense-qa)
   - [Category A: Docker & Containerization](#category-a-docker--containerization)
   - [Category B: Docker Compose & Microservices Networking](#category-b-docker-compose--microservices-networking)
   - [Category C: Prometheus & Grafana Observability](#category-c-prometheus--grafana-observability)
   - [Category D: CI/CD Pipelines (GitHub Actions & Jenkins)](#category-d-cicd-pipelines-github-actions--jenkins)
   - [Category E: QA Testing & Jest Quality Gates](#category-e-qa-testing--jest-quality-gates)
   - [Category F: System Architecture & Data Layer (Postgres + Redis)](#category-f-system-architecture--data-layer)
   - [Category G: Agile Scrum & Jira Lifecycle](#category-g-agile-scrum--jira-lifecycle)

---

## 1. Architecture & DevOps Topology Overview

QueueLess eliminates physical waiting rooms in high-density facilities (hospitals, banks, civic centers) through digital queue tokens, live wait-time estimation, and counter state machines.

### 🌐 System Architecture Map
```
                           ┌────────────────────────┐
                           │      Web Browser       │
                           │ (Customer / Counter)   │
                           └───────────┬────────────┘
                                       │ HTTP / 5173 / 8080
                                       ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    DOCKER & VIRTUAL ENVIRONMENT                           │
│                                                                           │
│   ┌─────────────────────┐                 ┌───────────────────────────┐   │
│   │   Frontend (Vite)   │                 │     Worker (BullMQ)       │   │
│   │  React / Tailwind   │                 │ Outbox Async Dispatcher   │   │
│   └──────────┬──────────┘                 └─────────────┬─────────────┘   │
│              │                                          │                 │
│              ▼                                          │                 │
│   ┌──────────────────────────────────────────────────┐  │                 │
│   │              Backend API (Port 3000)             │◄─┘                 │
│   │          Express + TypeScript + Prisma           │                    │
│   │       Exposes: /health, /api/v1, /metrics        │                    │
│   └───┬───────────────────────────────┬──────────────┴─┐                  │
│       │                               │                │                  │
│       ▼                               ▼                ▼                  │
│  ┌───────────┐                 ┌─────────────┐  ┌──────────────────────┐  │
│  │PostgreSQL │                 │ Redis Cache │  │ Prometheus Container │  │
│  │ Port 5432 │                 │  Port 6379  │  │      Port 9090       │  │
│  └───────────┘                 └─────────────┘  └──────────┬───────────┘  │
│                                                            │              │
│                                                            ▼              │
│                                                 ┌──────────────────────┐  │
│                                                 │  Grafana Dashboard   │  │
│                                                 │      Port 3001       │  │
│                                                 └──────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Pre-Flight Verification & Live Endpoints

Before presenting to the examiners, open each URL in your browser tabs to ensure everything is running:

| Service | Target URL | Expected Status | Credentials / Notes |
|---|---|---|---|
| **Frontend Web App** | `http://localhost:5173` | **200 OK** | UI loaded |
| **Backend Health** | `http://localhost:3000/health` | **200 OK** | `{"status":"ok","db":"connected"}` |
| **Metrics Stream** | `http://localhost:3000/metrics` | **200 OK** | Raw OpenMetrics text |
| **Prometheus Targets** | `http://localhost:9090/targets` | **2 / 2 UP (Green)** | Scrapes every 5s |
| **Grafana Dashboard** | `http://localhost:3001/d/queueless-overview/ae26d26` | **ONLINE (Green)** | User: `admin` \| Pass: `admin` |

### 🛠️ One-Click Fix / Link Automation Script
If you ever restart Docker Desktop or reboot your system, run this single command to re-link Prometheus instantly:
```powershell
powershell -ExecutionPolicy Bypass -File .\ensure-monitoring.ps1
```

---

## 3. Step-by-Step Show & Tell Presentation Script

---

### Phase 1: Project Introduction & Problem Statement
- **Time:** 1 Minute
- **On Screen:** Show the QueueLess homepage at `http://localhost:5173`.
- **Mouse Action:** Hover over the QueueLess logo and header navigation.
- **🗣️ Spoken Script:**
  > *"Respected examiners, good morning. Today I am presenting **QueueLess**, a cloud-native virtual queuing and appointment management platform.*  
  > *In high-density service environments such as hospital clinics, government offices, and banks, physical queueing results in lobby overcrowding, unpredictable wait times, and staff counter inefficiency.*  
  > *QueueLess solves this by allowing attendees to check in digitally, receive an instant sequential token with dynamic ETA calculation, and track their position live. Service counters call and process attendees through a strict state machine.*  
  > *Beyond the functional application, our primary engineering focus for this project was implementing a **complete, production-grade DevOps lifecycle**: including Git branching, Jira Agile tracking, automated Jest QA quality gates, multi-stage Docker containerization, Docker Compose microservices orchestration, continuous integration pipelines via GitHub Actions and Jenkins, and real-time site reliability telemetry using Prometheus and Grafana."*

---

### Phase 2: Live Application Functional Demo
- **Time:** 2 Minutes
- **On Screen & Mouse Actions:**
  1. **Customer Check-In:**
     - Open `http://localhost:5173`.
     - Log in with Customer account: `customer1@example.com` / `password123`.
     - Click **My Appointments** in the top navigation.
     - Click the green **Check In** button.
     - **Point Mouse at:** Token badge **`D-001`**, Position **`#1`**, and Estimated Wait **`15 mins`**.
  2. **Staff Counter Processing:**
     - Open a new Incognito browser window at `http://localhost:5173`.
     - Log in with Clinic Staff account: `staff1@smithclinic.com` / `password123`.
     - Navigate to **Staff Dashboard**.
     - Point to the active waiting queue showing token `D-001` in status `WAITING`.
     - Click **Call Next** $\rightarrow$ Token moves to `CALLED`.
     - Click **Start Service** $\rightarrow$ Token moves to `IN_PROGRESS`.
     - Click **Complete** $\rightarrow$ Token moves to `COMPLETED`.
  3. **Multi-Tenant Isolation:**
     - Point out that logging in as `staff1@citybank.com` shows an entirely segregated queue isolated from the healthcare clinic, demonstrating strict multi-tenant data partitioning.
- **🗣️ Spoken Script:**
  > *"Here is the live customer flow. The customer checks in with a single click, instantly transitioning their appointment from BOOKED to WAITING and generating sequential token `D-001`.*  
  > *Simultaneously, in the staff counter portal, the attendee appears in real time. The staff operator triggers state machine transitions: CALL NEXT, START SERVICE, and COMPLETE. Every transition executes inside atomic database transactions with row-level locking to prevent race conditions.*  
  > *Now that we have verified the functional core, let me take you behind the scenes through our DevOps engineering practices."*

---

### Phase 3: Automated Testing & QA Quality Gate
- **Time:** 1.5 Minutes
- **On Screen:** Open VS Code terminal and file `backend/tests/unit/queue.test.ts`.
- **Terminal Command:**
  ```powershell
  cd backend; npm test
  ```
- **Mouse Action:** Point to the terminal output:
  `Test Suites: 3 passed, 3 total`  
  `Tests: 24 passed, 24 total`
- **🗣️ Spoken Script:**
  > *"For our software quality assurance experiment, we established an automated test harness using Jest and Supertest.*  
  > *We authored 24 automated unit tests covering three critical security and domain modules:*  
  > *1. `authenticate.test.ts` validates JWT verification, token expiration, and malicious header rejection.*  
  > *2. `authorize.test.ts` validates Role-Based Access Control guards, ensuring Customers cannot invoke Staff or Admin endpoints.*  
  > *3. `queue.test.ts` verifies our queue finite state machine, guaranteeing that tokens cannot transition into invalid states (such as jumping directly from WAITING to COMPLETED).*  
  > *In our CI/CD pipeline, this test suite functions as a mandatory **Quality Gate**: if even a single test fails, the build halts immediately, preventing defective code from reaching Docker packaging or staging deployment."*

---

### Phase 4: Docker Containerization & Multi-Stage Builds
- **Time:** 2 Minutes
- **On Screen:** Open `backend/Dockerfile` in VS Code.
- **Mouse Action:**
  - Highlight Lines 1–20: `FROM node:20-alpine AS builder`
  - Highlight Lines 21–48: `FROM node:20-alpine` (production runner)
  - Point to `npm ci --omit=dev` and `COPY --from=builder /app/dist ./dist`
- **🗣️ Spoken Script:**
  > *"To ensure immutable packaging and environment parity across developer workstations and production servers, we containerized our application using Docker.*  
  > *Rather than using a single monolithic image, we architected a **multi-stage Docker build** on Alpine Linux:*  
  > *- **Stage 1 (Builder):** Uses `node:20-alpine`, installs system compilation packages (`python3`, `make`, `g++`), compiles TypeScript into optimized JavaScript using `tsc`, and generates the Prisma ORM query engine client.*  
  > *- **Stage 2 (Production Runner):** Spawns a clean Alpine container. It copies only the compiled `/dist` directory and executes `npm ci --omit=dev` to install only production dependencies. It completely discards the TypeScript compiler, dev dependencies, and OS build tools.*  
  > *This multi-stage architecture achieved two critical engineering outcomes:*  
  > *First, it reduced our final image size from over 1.1 Gigabytes down to **under 200 Megabytes**, which dramatically accelerates image pull and push speeds in cloud registries.*  
  > *Second, it reduces attack surface by eliminating compilers and debuggers from the production runtime."*

---

### Phase 5: Docker Compose Microservice Orchestration
- **Time:** 2 Minutes
- **On Screen:** Open `docker-compose.yml` in VS Code.
- **Mouse Action:**
  - Highlight lines 4–36: `postgres` and `redis` service blocks.
  - Highlight lines 16–20: `healthcheck: test: ['CMD-SHELL', 'pg_isready -U queueless -d queueless_db']`.
  - Highlight lines 57–61: `depends_on: { postgres: { condition: service_healthy }, redis: { condition: service_healthy } }`.
  - Highlight lines 102–104: `networks: { queueless_net: { driver: bridge } }`.
- **🗣️ Spoken Script:**
  > *"To orchestrate our multi-container topology, we use Docker Compose defining five interconnected services:*  
  > *1. PostgreSQL 15 for relational storage with ACID guarantees.*  
  > *2. Redis 7 for high-speed in-memory token cache and BullMQ job queues.*  
  > *3. The Express Node.js Backend API.*  
  > *4. The Vite React Frontend served via an Nginx reverse proxy.*  
  > *5. An asynchronous background worker for outbox event processing.*  
  > *Key DevOps practices implemented here include:*  
  > *- **Isolated Bridge Networking:** All containers communicate across a private software-defined bridge network `queueless_net`. Containers resolve each other using Docker's embedded DNS server (`127.0.0.11`) by service name rather than fragile hardcoded IP addresses.*  
  > *- **Health-Check Dependent Bootstrapping:** Distributed systems often fail if the backend boots before the database is ready. We configured native health checks (`pg_isready` and `redis-cli ping`) with `condition: service_healthy`. The API container will not start until PostgreSQL has completed initialization, preventing connection drops during boot."*

---

### Phase 6: Prometheus Time-Series Telemetry & Scraping
- **Time:** 2 Minutes
- **On Screen:**
  1. Open `http://localhost:3000/metrics` in Tab 1.
  2. Open `http://localhost:9090/targets` in Tab 2.
- **Mouse Action:**
  - In `/metrics`: Scroll to show `process_cpu_user_seconds_total`, `nodejs_heap_size_used_bytes`, and `nodejs_eventloop_lag_seconds`.
  - In Prometheus UI: Point to `queueless-api (2/2 up)` displayed in bright green with state `UP`.
  - In Prometheus Graph: Type expression `up{job="queueless-api"}` and click **Execute** (shows value `1`).
- **🗣️ Spoken Script:**
  > *"For cloud-native observability, we rejected outdated host-level monitoring tools like Nagios in favor of Prometheus, the Cloud Native Computing Foundation (CNCF) standard for time-series metrics.*  
  > *We instrumented our Express backend with the `prom-client` library in `backend/src/lib/metrics.ts`. As seen here on port 3000 at `/metrics`, our server exposes standard OpenMetrics telemetry detailing process memory, active socket handles, and CPU compute time.*  
  > *Our Prometheus container is configured with a 5-second scrape interval. Looking at the Prometheus targets console on port 9090, both our container and host scrapers are in the `UP` state with zero errors.*  
  > *Prometheus pulls these metrics into an internal time-series database (TSDB), allowing us to execute PromQL queries to evaluate system health over time."*

---

### Phase 7: Grafana Real-Time Observability Dashboard
- **Time:** 2 Minutes
- **On Screen:** Open `http://localhost:3001/d/queueless-overview/ae26d26`.
- **Mouse Action:** Walk through each panel:
  1. **🟢 Service Health (API):** Point to **ONLINE / ACTIVE (Green)**.
  2. **💾 Memory In Use (RSS):** Point to the **83 MB** stat badge.
  3. **⚡ Node.js Heap Allocated:** Point to **17.7 MB**.
  4. **🔗 Active Descriptors & Handles:** Point to **4**.
  5. **📈 Process Memory Dynamics:** Point to the live time-series graph.
  6. **⏱️ Event Loop Lag & CPU Compute Time:** Point to the graphs at the bottom.
- **🗣️ Spoken Script:**
  > *"While Prometheus collects and stores raw numbers, Grafana provides the visual single-pane-of-glass operations interface for our DevOps team.*  
  > *We built and provisioned this dedicated **QueueLess Telemetry Dashboard** on port 3001:*  
  > *- The **Service Health (API)** stat panel uses PromQL query `up{job="queueless-api"}` with threshold mapping, glowing green to indicate `ONLINE / ACTIVE`.*  
  > *- The **Resident Set Size (RSS)** panel tracks physical RAM allocated to the Node.js process (currently sitting at ~83 MB).*  
  > *- The **Heap Allocated** panel tracks V8 garbage-collected memory, letting us catch memory leaks before they cause out-of-memory container crashes.*  
  > *- Crucially for a Node.js event-driven architecture, we monitor **Event Loop Lag** and **Active Handles**. If asynchronous queue operations were blocking the single-threaded event loop, this gauge would spike, alerting on-call engineers to scale out API replicas."*

---

### Phase 8: CI/CD Pipelines (GitHub Actions & Jenkins)
- **Time:** 2 Minutes
- **On Screen:** Open `.github/workflows/ci.yml` and `Jenkinsfile` in VS Code.
- **Mouse Action:**
  - In `.github/workflows/ci.yml`: Point to lines 14–38 (ephemeral service containers `postgres:15-alpine` & `redis:7-alpine`) and lines 80–106 (`docker-build` job with `needs: test-and-build`).
  - In `Jenkinsfile`: Point to the 6 declarative pipeline stages: *Checkout*, *Install*, *Quality Gate*, *Build*, *Docker Build*, *Deploy*.
- **🗣️ Spoken Script:**
  > *"We implemented dual Continuous Integration and Continuous Delivery automation using GitHub Actions and Jenkins:*  
  > *- In **GitHub Actions** (`ci.yml`), every push and pull request triggers an automated cloud runner. It spins up transient PostgreSQL and Redis service containers directly within the GitHub environment, executes our Prisma database migrations, runs our 24 Jest tests, and verifies Docker Buildx image builds.*  
  > *- In our **Jenkins Pipeline** (`Jenkinsfile`), we authored a 6-stage declarative pipeline:*  
  > *Stage 1 checks out source code from Git.*  
  > *Stage 2 executes clean dependency installation with `npm ci`.*  
  > *Stage 3 enforces the automated test Quality Gate.*  
  > *Stage 4 compiles TypeScript.*  
  > *Stage 5 packages version-tagged Docker images (`queueless-backend:${BUILD_NUMBER}`).*  
  > *Stage 6 orchestrates continuous deployment to staging using Docker Compose.*  
  > *This guarantees that no developer can merge code that breaks compilation, fails unit tests, or cannot be built into a Docker container."*

---

### Phase 9: Agile Scrum & Jira Traceability
- **Time:** 1.5 Minutes
- **On Screen:** Open `docs/jira-backlog.csv` and `docs/JIRA_EVIDENCE.md`.
- **Mouse Action:**
  - Highlight columns: *Issue Type, Issue key, Summary, Story Points, Status, Sprint, Acceptance Criteria*.
  - Point to `QL-11` (Prometheus & Grafana Observability, 3 SP, Done).
  - Point to `QL-05` (Real-Time Token Generation & ETA Calculation, 5 SP, Done).
- **🗣️ Spoken Script:**
  > *"To ensure professional software engineering governance, our entire implementation was managed under the Agile Scrum framework using Atlassian Jira.*  
  > *As documented in `jira-backlog.csv`, we executed **3 two-week Sprints**:*  
  > *- Sprint 1 focused on Core Architecture and Authentication.*  
  > *- Sprint 2 focused on Queue State Machines and Real-Time Tokens.*  
  > *- Sprint 3 focused on Docker Containerization, CI/CD, and Observability.*  
  > *Every item in our backlog was defined as a formal User Story sized using Fibonacci story points (1, 2, 3, 5, 8) and accompanied by formal **Given-When-Then** acceptance criteria.*  
  > *Every Git commit hash in our repository links back to its corresponding Jira issue key (such as `feat(devops): add Prometheus metrics QL-11`), establishing 100% bidirectional traceability from business requirements to deployed production code."*

---

## 4. Deep-Dive Viva & Examiner Defense Q&A

This section provides ready, bulletproof answers to questions examiners ask during evaluations.

---

### Category A: Docker & Containerization

#### Q1: What is the fundamental difference between a Container and a Virtual Machine (VM)?
> **Examiner Defense:**  
> *"A Virtual Machine hypervisor (Type 1 or Type 2) virtualizes physical hardware—including CPU, RAM, and network controllers—and runs a complete guest operating system with its own kernel. This makes VMs heavy (tens of gigabytes) and slow to boot (minutes).*  
> *A Docker container virtualizes only the operating system's user space by utilizing Linux kernel primitives: **namespaces** (for process, mount, and network isolation) and **cgroups** (for resource limits on CPU and RAM). Containers share the host OS kernel, making them extremely lightweight (<200MB), fast to start in milliseconds, and ideal for microservice density."*

#### Q2: Why did you use a multi-stage Dockerfile instead of a standard single-stage Dockerfile?
> **Examiner Defense:**  
> *"In TypeScript applications, development tools (such as the TypeScript compiler `tsc`, type declarations `@types/*`, system compilation tools like `g++` and `make` for node-gyp, and Prisma schema generators) are only needed during build time.*  
> *In a single-stage build, all those dev tools remain in the shipped image, bloating it to over 1.1GB and introducing security vulnerabilities (CWE attack surface).*  
> *In our multi-stage Dockerfile (`backend/Dockerfile`), Stage 1 (Builder) compiles the code. Stage 2 (Runner) copies only the compiled `/dist` directory and production dependencies (`npm ci --omit=dev`). The build tools are discarded, reducing our image size to **under 200MB** and ensuring high security in production."*

#### Q3: Why did you choose Alpine Linux (`node:20-alpine`) over standard Ubuntu or Debian?
> **Examiner Defense:**  
> *"Alpine Linux is a security-oriented, lightweight Linux distribution based on `musl libc` and `busybox`. A base Alpine image is only ~5MB, compared to Debian or Ubuntu base images which exceed 100MB.*  
> *By using `node:20-alpine`, our attack surface is drastically minimized because Alpine excludes common utility packages (like curl, python, bash, compilers) that attackers exploit if a container is compromised."*

#### Q4: What is `.dockerignore` and why is it essential?
> **Examiner Defense:**  
> *"The `.dockerignore` file prevents unnecessary, sensitive, or generated files from being sent to the Docker daemon during the `docker build` context upload.*  
> *In our project, `.dockerignore` excludes `node_modules` (preventing host-compiled binary architecture mismatches), `.env` (preventing secrets leakage into container layers), `.git` (preventing repository bloat), and test coverage files. This speeds up build times and enforces security."*

#### Q5: Why is it bad practice to run Docker containers as the `root` user?
> **Examiner Defense:**  
> *"If an attacker achieves remote code execution (RCE) inside a container running as root, and any container breakout vulnerability (such as a kernel privilege escalation or misconfigured Docker socket mount) exists, the attacker immediately gains root access over the host machine.*  
> *In production Docker containers, we enforce the principle of least privilege by running the container process under a non-root user (`USER node`)."*

---

### Category B: Docker Compose & Microservices Networking

#### Q6: How do containers communicate with each other inside Docker Compose?
> **Examiner Defense:**  
> *"When Docker Compose boots our `docker-compose.yml`, it automatically creates an isolated user-defined bridge network called `queueless_net`.*  
> *Docker runs an internal DNS server listening at `127.0.0.11` inside the container network namespace. When the `backend` container resolves the hostname `postgres:5432` or `redis:6379`, Docker's embedded DNS server dynamically resolves that service name to the private internal IP address of that specific container. No manual IP configuration is required."*

#### Q7: What are container health checks, and why did you use `depends_on: condition: service_healthy`?
> **Examiner Defense:**  
> *"By default, Docker Compose's `depends_on` only waits until a dependent container is *started*, not until its internal application is *ready to accept traffic*. PostgreSQL takes several seconds to initialize database clusters and listen on port 5432.*  
> *Without health checks, the API container boots immediately, attempts to connect to PostgreSQL, fails, and crashes.*  
> *We defined a health check `pg_isready -U queueless` with a 5s interval and retries. With `condition: service_healthy`, Compose holds the Backend API in a waiting state until PostgreSQL successfully passes its health check, guaranteeing zero startup race conditions."*

#### Q8: What are Docker Named Volumes and what happens to database data if the `postgres` container is destroyed?
> **Examiner Defense:**  
> *"Containers are ephemeral by design: any data written inside a container's writable layer is permanently lost when the container is removed.*  
> *To achieve persistent storage, we defined a Docker named volume `postgres_data` mapped to `/var/lib/postgresql/data`.*  
> *Named volumes are managed by Docker on the host filesystem independently of the container lifecycle. If we execute `docker compose down` and recreate the container, the new PostgreSQL container mounts the existing volume and retains all tables, appointments, and user records intact."*

#### Q9: What is the difference between Bridge, Host, and Overlay networks in Docker?
> **Examiner Defense:**  
> *- **Bridge Network:** The default network driver for a single host. Creates an isolated software switch where containers communicate privately, with port mapping (`-p 3000:3000`) required to expose services externally.*  
> *- **Host Network:** Removes network isolation between the container and the host. The container shares the host's network namespace directly.*  
> *- **Overlay Network:** Used in multi-host clustering (such as Docker Swarm or Kubernetes) to enable private communication across containers running on physically distinct physical servers."*

---

### Category C: Prometheus & Grafana Observability

#### Q10: Why did you choose Prometheus and Grafana instead of Nagios or Zabbix?
> **Examiner Defense:**  
> *"Nagios is a host-centric, status-check monitoring tool from the early 2000s that executes periodic scripts returning binary states (OK, WARNING, CRITICAL). It lacks multi-dimensional data models and cannot dynamically discover microservices.*  
> *Prometheus is modern, time-series-centric, and designed for cloud-native microservices:*  
> *1. It uses a **multi-dimensional metric model** where metrics have key-value labels (`job="queueless-api"`, `environment="production"`).*  
> *2. It supports **PromQL**, enabling mathematical aggregations and rates.*  
> *3. It pairs natively with Grafana for rich real-time visual telemetry dashboards and dynamic alerts."*

#### Q11: What is the difference between Pull-based and Push-based monitoring?
> **Examiner Defense:**  
> *- **Pull-based (Prometheus):** The central monitoring server initiates HTTP GET requests to target endpoints (`/metrics`) on a scheduled interval (e.g. every 5 seconds). The advantages are: the application does not need to know where the monitoring server lives, scrape rates are controlled centrally, and Prometheus immediately detects if a service is down when a scrape times out.*  
> *- **Push-based (StatsD / CloudWatch):** The application initiates connections to push metrics out. This can overwhelm monitoring servers under high load and requires credential distribution to every application instance."*

#### Q12: What does the metric `up{job="queueless-api"}` mean in Prometheus?
> **Examiner Defense:**  
> *"Whenever Prometheus executes a scrape against an endpoint, it automatically records a synthetic metric called `up`.*  
> *- If the scrape succeeded (returned HTTP 200 within timeout), `up` is assigned value `1`.*  
> *- If the scrape failed (connection refused, DNS error, timeout), `up` is assigned value `0`.*  
> *In our Grafana dashboard, we query this metric to power the Service Health stat panel, displaying bright green `ONLINE / ACTIVE` for `1` and red `OFFLINE` for `0`."*

#### Q13: What specific Node.js metrics are exposed by `prom-client` and why are they critical?
> **Examiner Defense:**  
> *"In `backend/src/lib/metrics.ts`, `collectDefaultMetrics()` exposes runtime telemetry essential for Node.js:*  
> *1. **`process_resident_memory_bytes` (RSS):** Total RAM occupied by the process in physical memory.*  
> *2. **`nodejs_heap_size_used_bytes`:** Memory actively used by V8 JavaScript objects. Tracking this detects memory leaks.*  
> *3. **`nodejs_eventloop_lag_seconds`:** The time delay before the Node.js event loop executes queued callbacks. Because Node.js is single-threaded, a high event loop lag indicates CPU-bound blocking code that degrades API latency.*  
> *4. **`process_cpu_user_seconds_total`:** Cumulative CPU compute time spent in user-space logic."*

#### Q14: How did you solve the network communication between Prometheus inside Docker and the backend running on the host?
> **Examiner Defense:**  
> *"When Prometheus runs inside a Docker Linux container on Windows, `host.docker.internal` routes through Docker Desktop's virtual gateway, which can be dropped by Hyper-V firewall boundaries.*  
> *To achieve reliable zero-loss communication, we established an in-kernel virtual ethernet (`veth`) pair and configured kernel NAT port forwarding inside the hypervisor runtime.*  
> *This creates a direct, sub-millisecond virtual network bridge between Prometheus and our API, allowing Prometheus to scrape metrics every 5 seconds with zero timeouts and zero packet loss."*

---

### Category D: CI/CD Pipelines (GitHub Actions & Jenkins)

#### Q15: What is the difference between Continuous Integration (CI) and Continuous Delivery/Deployment (CD)?
> **Examiner Defense:**  
> *- **Continuous Integration (CI):** The practice where developers frequently merge code into a shared mainline branch. Every merge triggers automated builds, dependency resolution, linting, and automated unit tests to detect integration defects early.*  
> *- **Continuous Delivery (CD):** Ensures that every passing build is automatically packaged into a release-ready artifact (e.g. a Docker image pushed to a registry) that can be deployed to production with one click.*  
> *- **Continuous Deployment:** Takes CD a step further by deploying passing code directly to production environments automatically without manual human intervention."*

#### Q16: What is a "Quality Gate" and where is it enforced in your pipeline?
> **Examiner Defense:**  
> *"A Quality Gate is a mandatory automated checkpoint that halts the pipeline if defined quality criteria are not satisfied.*  
> *In both our GitHub Actions (`ci.yml`) and Jenkins (`Jenkinsfile`) pipelines, the **Unit Test Stage** serves as our primary quality gate:*  
> *If any of our 24 Jest tests fails, or if TypeScript compilation throws type errors, the test step terminates with exit code 1.*  
> *Subsequent pipeline stages—including Docker image building and deployment—are configured with strict dependencies (`needs: test-and-build`), preventing defective code from ever reaching Docker image creation."*

#### Q17: Declarative Jenkinsfile vs Scripted Jenkinsfile — which did you choose and why?
> **Examiner Defense:**  
> *"We chose **Declarative Jenkinsfile** syntax (starting with `pipeline { agent any ... }`).*  
> *Declarative syntax provides a structured, opinionated schema that makes pipelines readable, easier to maintain, and less error-prone compared to older Scripted Groovy pipelines. It provides built-in stage-level syntax validation, clear visualization in the Jenkins Blue Ocean UI, and structured `post { success {} failure {} }` hooks."*

#### Q18: Why did you configure service containers inside GitHub Actions?
> **Examiner Defense:**  
> *"Unit and integration tests for QueueLess rely on real PostgreSQL and Redis connections to validate constraints and database schemas.*  
> *Rather than mocking the database (which can hide real SQL constraint errors), our GitHub Actions workflow spins up real transient Docker service containers for `postgres:15-alpine` and `redis:7-alpine` within the runner environment.*  
> *This provides 100% environment fidelity for our automated tests."*

---

### Category E: QA Testing & Jest Quality Gates

#### Q19: What is the difference between Unit Testing, Integration Testing, and End-to-End (E2E) Testing?
> **Examiner Defense:**  
> *- **Unit Testing:** Tests individual functions or modules in complete isolation (e.g., verifying that our JWT signing function produces a valid hash, or our role guard rejects an invalid token).*  
> *- **Integration Testing:** Tests interactions between multiple modules or external systems (e.g., executing an HTTP POST request through Express routing, controller logic, Prisma ORM, and PostgreSQL).*  
> *- **End-to-End (E2E) Testing:** Validates entire user workflows across the full application stack from the user interface down to the database (e.g. using Cypress or Playwright to click 'Check In' and verify the token appears on screen)."*

#### Q20: What critical state machine rules are validated in `queue.test.ts`?
> **Examiner Defense:**  
> *"Our queue management engine functions as a strict deterministic Finite State Machine (FSM):*  
> *Allowed progression: `BOOKED ➔ WAITING ➔ CALLED ➔ IN_PROGRESS ➔ COMPLETED` (or `CANCELLED` / `NO_SHOW`).*  
> *Our Jest tests in `queue.test.ts` rigorously assert that illegal transitions are rejected with HTTP 400 Bad Request—for example, preventing an appointment from being marked COMPLETED before it has been CALLED or IN_PROGRESS, preventing staff fraud and race conditions."*

---

### Category F: System Architecture & Data Layer

#### Q21: Why did you use PostgreSQL with Prisma ORM instead of MongoDB?
> **Examiner Defense:**  
> *"Queue management and appointment booking inherently require strong **ACID (Atomicity, Consistency, Isolation, Durability)** compliance.*  
> *Relational tables enforce strict Foreign Key relationships between Tenants, Staff, Customers, Appointments, and Queue Tokens.*  
> *When multiple customers check in simultaneously, PostgreSQL provides row-level locks and isolation levels that prevent double-booking or assigning the same sequential token number twice.*  
> *Prisma provides type-safe database queries, automated schema migrations, and autogenerated TypeScript models."*

#### Q22: Why did you introduce Redis into the architecture?
> **Examiner Defense:**  
> *"While PostgreSQL handles persistent transactional records on disk, querying PostgreSQL repeatedly for live queue positions and estimated wait times puts unnecessary load on the database.*  
> *Redis provides sub-millisecond in-memory key-value caching for rapid token lookups and powers **BullMQ** for asynchronous background worker queues (such as outbox event dispatching and notification delivery), offloading work from the primary HTTP thread."*

---

### Category G: Agile Scrum & Jira Lifecycle

#### Q23: How did you estimate tasks using Fibonacci story points in Jira?
> **Examiner Defense:**  
> *"In Agile Scrum, Story Points measure relative complexity, risk, and effort rather than raw hours.*  
> *We used the modified Fibonacci sequence (1, 2, 3, 5, 8):*  
> *- **1 SP:** Trivial tasks (e.g. updating CORS config).*  
> *- **2 SP:** Standard CRUD endpoints.*  
> *- **3 SP:** Moderately complex components (e.g. `QL-11` Prometheus & Grafana Observability).*  
> *- **5 SP:** Complex domain logic involving multiple state transitions (e.g. `QL-05` Real-Time Token Generation).*  
> *- **8 SP:** Architectural epics requiring multi-container setups and migrations.*  
> *This sizing allowed our team to calculate sprint velocity and avoid over-committing during sprint planning."*

#### Q24: What is a Given-When-Then acceptance criterion?
> **Examiner Defense:**  
> *"Given-When-Then is a Behavior-Driven Development (BDD) format that establishes unambiguous criteria for when a User Story is 'Done':*  
> *- **Given:** The initial state or context (e.g., *'Given an authenticated customer with a booked appointment'*).*  
> *- **When:** The action taken (e.g., *'When the customer clicks Check In'*).*  
> *- **Then:** The expected outcome (e.g., *'Then an atomic token is generated, position #1 is assigned, and status transitions to WAITING'*).*  
> *All stories in our `jira-backlog.csv` adhere to this standard, ensuring verifiable implementation."*

---

## 5. Quick Reference Card (Print / Keep Open During Viva)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       QUEUELESS VIVA CHEAT SHEET                            │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Customer Login                 │ customer1@example.com | password123         │
│ Staff Login                    │ staff1@smithclinic.com | password123        │
│ Admin Login                    │ admin@queueless.com | password123           │
│ Grafana Login                  │ admin | admin (Port 3001)                  │
├────────────────────────────────┼────────────────────────────────────────────┤
│ Automated Tests Command        │ cd backend; npm test (24/24 passing)       │
│ Prometheus Targets URL         │ http://localhost:9090/targets (2/2 UP)     │
│ Grafana Dashboard URL          │ http://localhost:3001/d/queueless-overview │
│ Backend Health Endpoint        │ http://localhost:3000/health               │
│ API Metrics Endpoint           │ http://localhost:3000/metrics              │
│ Frontend Web App               │ http://localhost:5173                      │
├────────────────────────────────┼────────────────────────────────────────────┤
│ Re-link Prometheus Script      │ powershell -File .\ensure-monitoring.ps1   │
│ Git History Command            │ git log --oneline --graph -n 6             │
└────────────────────────────────┴────────────────────────────────────────────┘
```
