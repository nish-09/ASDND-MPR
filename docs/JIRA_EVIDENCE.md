# QueueLess — Agile & Jira Laboratory Documentation

## 1. Project Overview & Methodology
The development of **QueueLess** was managed using **Agile Scrum Methodology**, tracked via **Jira**.

- **Sprint Duration:** 2 Weeks per Sprint (3 Sprints total)
- **Scrum Team:** Kaushal Patil (Full-stack Developer & DevOps Engineer)
- **Tooling:** Atlassian Jira, Git, GitHub
- **Estimation Scale:** Fibonacci Sequence (1, 2, 3, 5, 8, 13)

---

## 2. Epics Breakdown

| Epic Key | Epic Name | Description | Total Story Points |
|---|---|---|---|
| **QL-E1** | Core Platform Architecture & Auth | Baseline infrastructure, Prisma models, dual-token JWT security, RBAC | 11 SP |
| **QL-E2** | Queue Management & Booking Engine | Booking slot concurrency check, atomic token issuance, queue state machine | 18 SP |
| **QL-E3** | DevOps Automation & Observability | Multi-stage Docker, Compose orchestration, GitHub Actions, Jenkins, Prometheus | 21 SP |

---

## 3. Sprint Planning & Execution

### Sprint 1: Foundation, Data Modeling & Authentication
- **Sprint Goal:** Establish clean database schemas and secure JWT-based role authentication.
- **Velocity:** 11 Story Points completed.
- **Stories:**
  - `QL-1`: Database Schema & Migrations (5 SP) — Git Commit: `4e92db4`
  - `QL-2`: JWT Authentication Middleware (3 SP) — Git Commit: `d226d80`
  - `QL-3`: Role-Based Access Control Middleware (3 SP) — Git Commit: `a1d1a61`

### Sprint 2: Booking Engine & Queue State Machine
- **Sprint Goal:** Deliver full customer booking and staff counter dispatch dashboard.
- **Velocity:** 18 Story Points completed.
- **Stories:**
  - `QL-4`: Slot Booking & Concurrency Protection (8 SP) — Git Commit: `0d2658a`
  - `QL-5`: Token Generation & Check-in (5 SP) — Git Commit: `0d2658a`
  - `QL-6`: Staff Counter Live Dashboard (5 SP) — Git Commit: `0d2658a`

### Sprint 3: DevOps Containerization, CI/CD & Monitoring
- **Sprint Goal:** Containerize all services with Docker Compose, setup CI/CD pipelines and Prometheus metrics.
- **Velocity:** 21 Story Points completed.
- **Stories:**
  - `QL-7`: Multi-stage Docker Containerization (5 SP)
  - `QL-8`: Docker Compose Multi-Service Architecture (5 SP)
  - `QL-9`: GitHub Actions Automated CI (3 SP)
  - `QL-10`: Jenkins Declarative Pipeline (5 SP)
  - `QL-11`: Prometheus & Grafana Observability (3 SP)

---

## 4. User Story Example & Acceptance Criteria

### Story `QL-5`: Atomic Token Generation & Customer Check-In
- **As a:** Registered customer holding an upcoming appointment,
- **I want to:** Check in on the day of my appointment,
- **So that:** I receive an atomic queue token number, estimated wait time, and join the active queue.

#### Acceptance Criteria (Given - When - Then):
1. **Given** a user has a `BOOKED` appointment for today,
2. **When** the user clicks "Check In",
3. **Then** an atomic `TokenCounter` transaction increments the daily token number,
4. **And** a `QueueEntry` is created with status `WAITING`,
5. **And** a formatted label like `D-001` or `C-002` is returned with the real-time position and ETA.

---

## 5. Jira & Git Integration Workflow
Every Git commit follows conventional commits referencing the Jira task or phase:
- `chore(task-0.1): Scaffolded backend`
- `feat(task-0.2): Schema, migration, and seed`
- `fix: updated remaining 'ORGANIZER' strings to 'ADMIN' in tests`
- `feat: implement QueueLess appointment booking, queue management...`
