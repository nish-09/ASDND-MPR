# QueueLess 2.0 — AI Context

Rewrite of the old EventBook repo into **QueueLess**: appointment → check-in → live queue → position/ETA → service → notify. Build the app first (Phases 0–5), then DevOps (Phase 6). UI already exists: wire it, never restyle it.

## 1. Rules
- One task at a time, in order (Section 7). Done = lint + typecheck + tests + build all green. Never weaken or skip tests.
- Before each task: 3-line analysis (files affected, invariants at risk, edge cases).
- No placeholders, no TODOs, no `any`. Backend imports use `@/` (no `../../`).
- Every route: Zod validate → authenticate → authorize (role + ownership) → service → standard error shape.
- Business logic only in services. Controllers are thin. Prisma only in services.
- Never edit `frontend/src/index.css` or `App.css`. Never commit secrets (`.env` ignored, commit `.env.example`).
- Spec silent? Pick the simplest option, log it in Section 5, continue. Ask only if it changes the API, data model, or UI design.
- Git: branch per task, conventional commits, merge to `main`.
- After each task update Section 6 (status + one changelog line).

## 2. Stack
React + Vite + TS (existing) · Node + Express + TS strict · PostgreSQL + Prisma · JWT (access 15m + rotating refresh 7d, hashed in DB) + bcrypt · Zod · Helmet, CORS allowlist, `express-rate-limit` · Redis + BullMQ · `pino` · `prom-client` · Jest + Supertest (real Postgres/Redis) · Docker, Compose, GitHub Actions, Jenkins, Prometheus + Grafana.

Backend layout: `src/{app,server,worker}.ts`, `config/env.ts`, `lib/` (prisma, redis, logger, errors, metrics), `middleware/`, and modules `auth/ providers/ services/ appointments/ queue/ notifications/ outbox/ analytics/`. Tests in `backend/tests/{unit,integration}`. Infra in `infra/`, docs in `docs/`.

## 3. Invariants (never break)
1. **No double-booking:** partial unique index `ON "Appointment"("providerId","startsAt") WHERE status <> 'CANCELLED'` + transaction.
2. **Idempotency:** `POST /appointments` and `POST /appointments/:id/check-in` honor `Idempotency-Key`. Same key + same body → replay response. Same key + different body → `409`.
3. **Queue status changes only via the state machine** (4.1).
4. **Every state change = one DB transaction that also inserts an `OutboxEvent`.** Handlers never publish to Redis directly.
5. **Call-next uses `SELECT … FOR UPDATE SKIP LOCKED`.**
6. **Authorize everywhere:** customers see only their rows; STAFF only their own provider.
7. Slow work (notifications, reminders, auto no-show) runs in BullMQ workers, not requests.
8. DB times in UTC; queue day uses `Provider.timezone` (default `Asia/Kolkata`).
9. Never trust client-sent `userId`, `role`, `providerId`, `status`.

## 4. Spec

### Data model (Prisma)
Enums: `Role {CUSTOMER STAFF PROVIDER ADMIN}`, `AppointmentStatus {BOOKED CHECKED_IN IN_SERVICE COMPLETED CANCELLED NO_SHOW}`, `QueueStatus {WAITING CALLED IN_SERVICE COMPLETED SKIPPED NO_SHOW CANCELLED}`, `OutboxStatus {PENDING PROCESSED FAILED}`.

| Model | Fields |
|---|---|
| User | id, email (unique), name, phone?, passwordHash, role (default CUSTOMER), providerId? |
| RefreshToken | id, userId, tokenHash (unique), expiresAt, revokedAt? |
| Provider | id, name, category, timezone, isActive |
| ProviderAvailability | id, providerId, weekday 0-6, startMin, endMin; unique(providerId, weekday, startMin) |
| Service | id, providerId, name, durationMin, isActive |
| Appointment | id, userId, providerId, serviceId, startsAt, endsAt, status, priority (0/1/2), notes? |
| QueueEntry | id, appointmentId (unique), providerId, queueDate (Date), tokenNumber, tokenLabel, status, priority, checkedInAt, requeuedAt?, calledAt?, serviceStartedAt?, completedAt?, skipCount; unique(providerId, queueDate, tokenNumber) |
| TokenCounter | providerId, queueDate, lastNumber; PK(providerId, queueDate) |
| OutboxEvent | id, type, aggregateId, payload Json, status, attempts, createdAt, processedAt? |
| IdempotencyKey | id, key, userId, requestHash, responseCode?, responseBody?; unique(userId, key) |
| Notification | id, userId, type, message, readAt?, createdAt |

Add indexes on foreign keys and `(providerId, queueDate, status)`.

### 4.1 Queue state machine (only legal transitions; else `409 INVALID_STATE_TRANSITION`)
| Action | From → To | Extra |
|---|---|---|
| checkIn | appointment BOOKED → WAITING | token issued; appointment CHECKED_IN |
| callNext | WAITING → CALLED | 409 `SERVER_BUSY` if provider already has CALLED/IN_SERVICE |
| start | CALLED → IN_SERVICE | |
| complete | IN_SERVICE → COMPLETED | appointment COMPLETED |
| skip | CALLED → SKIPPED | skipCount++ |
| requeue | SKIPPED → WAITING | `requeuedAt=now`; if skipCount > 2 → NO_SHOW |
| noShow | CALLED/SKIPPED → NO_SHOW | appointment NO_SHOW |
| cancel | WAITING → CANCELLED | appointment CANCELLED |

Each transition writes an outbox event (`queue.joined/called/completed/skipped/no_show/cancelled`).

- **Order:** priority DESC, then `COALESCE(requeuedAt, checkedInAt)` ASC, then tokenNumber ASC.
- **Position:** 1 + number of WAITING entries ahead (same provider + day).
- **ETA** (pure function): `ceil(peopleAhead × avgServiceMin + remainingOfCurrent)`. `avgServiceMin` = mean of last 20 completed durations (30 days), fallback `Service.durationMin` if under 3 samples.
- **Token:** atomic `TokenCounter` upsert in the check-in transaction; label like `A-012`.
- **Check-in window:** −30 to +60 min of `startsAt`, else `422 CHECKIN_WINDOW_CLOSED`. Owner or STAFF only.
- **Auto no-show:** BullMQ job every minute; CALLED > 5 min → noShow via state machine.
- **Priority** set by STAFF at check-in only.

### Roles
CUSTOMER (own bookings/queue) · STAFF (own provider's queue) · PROVIDER (STAFF + services/availability + analytics) · ADMIN (all).

### API (`/api/v1`, errors: `{ "error": { "code", "message", "details" } }`)
| Area | Endpoints |
|---|---|
| Auth | POST `/auth/register` (CUSTOMER only), `/auth/login`, `/auth/refresh` (rotate; reuse of revoked token revokes all), `/auth/logout`; GET `/me` |
| Catalog | GET `/providers`, `/providers/:id/services`, `/providers/:id/availability?date=&serviceId=`; PROVIDER/ADMIN CRUD for services and availability rules; ADMIN creates providers and sets roles |
| Appointments | POST `/appointments` (Idempotency-Key), GET `/appointments`, GET `/appointments/:id`, POST `/:id/cancel`, POST `/:id/check-in` (Idempotency-Key) |
| Queue | GET `/queue/me`, GET `/queue/provider/:id`, POST `/queue/provider/:id/call-next`, POST `/queue/entries/:id/{start,complete,skip,requeue,no-show,cancel}` |
| Other | GET/POST `/notifications`, `/notifications/:id/read`; GET `/analytics/provider/:id?from=&to=`; GET `/health` (`{status,db,redis}`, 503 if down); GET `/metrics` |

Pagination: `?page&limit` → `{ data, page, limit, total }`. Codes: 400, 401, 403, 404, 409, 422, 429, 500 (sanitized).

### Required tests
- Unit: state machine (all pairs), ETA, token label, slot generator.
- 20 parallel bookings of one slot → exactly 1 succeeds.
- Same Idempotency-Key twice → one row; different body → 409.
- Parallel call-next → never the same entry.
- Full lifecycle; skip → requeue ordering; requeue limit → NO_SHOW; cancel frees slot.
- Outbox row per transition → relay → worker creates Notification.
- RBAC matrix, including customer-vs-customer and staff-vs-other-provider isolation.
- Coverage ≥ 80% on `queue/`, `appointments/`, `auth/`.

### Frontend rules
Keep existing layout, components, CSS. Reuse `src/api.ts` (base `${VITE_API_URL}/api/v1`, auto-refresh on 401). Rebuild page content: Login, Register, Browse Providers, Book Appointment, My Appointments, My Queue (poll 5s), Staff Queue Dashboard, Provider service/availability, Notifications, Analytics. Delete MockCheckout. Role-based route guards. Loading/empty/error states everywhere.

## 5. Decisions (final)
- No walk-ins. STAFF belong to one provider. One serving counter per provider.
- Roles replaced with the 4 above; seed creates 1 ADMIN, 2 providers (with services + availability), STAFF per provider, 5 customers.
- Remove Stripe/payments/webhooks. CORS allowlist from `CORS_ORIGIN`. Rate limit: 10/min on `/auth/*`, 100/min global.
- Refresh token in `localStorage`, access token in memory.
- Ports: backend 3000, frontend 8080, Prometheus 9090, Grafana 3001, Jenkins 8088.
- Deploy target: one Linux host over SSH from Jenkins; if none, deploy to local Docker and say so.
- AI-logged decisions: _(append here)_

## 6. Progress (AI updates)
Current task: **0.3** · Last green build: 0.2

| Task | Status |
|---|---|
| 0.1 Scaffold | ✅ |
| 0.2 Schema + migration + seed | ✅ |
| 0.3 Test harness | 🔵 |
| 1.1 Auth (dual token) | ⬜ |
| 1.2 RBAC, rate limit, CORS | ⬜ |
| 1.3 Catalog + slot generator | ⬜ |
| 2.1 Idempotency middleware | ⬜ |
| 2.2 Appointments + concurrency tests | ⬜ |
| 3.1 State machine + token + check-in | ⬜ |
| 3.2 Position/ETA + queue views | ⬜ |
| 3.3 Queue actions + concurrency tests | ⬜ |
| 4.1 Outbox relay + BullMQ worker | ⬜ |
| 4.2 Notifications + maintenance jobs | ⬜ |
| 4.3 Analytics + demo seed | ⬜ |
| 5.1 API client, auth, guards | ⬜ |
| 5.2 Wire all screens | ⬜ |
| 6.1 Hardening + `/metrics` | ⬜ |
| 6.2 Dockerfiles + Compose stack | ⬜ |
| 6.3 GitHub Actions CI | ⬜ |
| 6.4 Jenkinsfile (CI + deploy) | ⬜ |
| 6.5 Prometheus + Grafana | ⬜ |
| 6.6 Jira CSV + DEVOPS_EVIDENCE.md + README | ⬜ |

Legend: ⬜ todo · 🔵 doing · ✅ done · ⛔ blocked
Changelog: _(newest first)_
- [0.2] Replaced Prisma schema, generated init migration with raw partial unique index, wrote seed script.
- [0.1] Scaffolded backend: pino, env vars, metrics, @ alias, server.ts. Removed EventBook specifics.
## 7. Build Plan

**Phase 0 — Foundation**
- **0.1** Backend scaffold: add `pino`, `pino-http`, `express-rate-limit`, `prom-client`; `@/` alias (tsconfig + Jest + build); `lib/` split; `app.ts` under `/api/v1`; rename `index.ts` → `server.ts` with graceful shutdown; env vars (`CORS_ORIGIN`, access/refresh secrets + expiries, `TEST_DATABASE_URL`); `/health`. Remove Stripe, EventBook routes/services/tests.
- **0.2** Replace Prisma schema, delete old migrations, init migration + raw partial unique index, seed.
- **0.3** Test harness: test DB, `resetDb`, `createUser`, `loginAs`.

**Phase 1 — Auth & Catalog**
- **1.1** Register/login/refresh rotation + reuse detection/logout/`/me`.
- **1.2** `authenticate`/`authorize`/ownership helpers, rate limiting, CORS, RBAC tests.
- **1.3** Providers/services/availability CRUD + slot generator (availability minus active appointments, provider tz, past slots excluded).

**Phase 2 — Appointments**
- **2.1** Idempotency middleware (hash method+path+body).
- **2.2** Create/list/get/cancel, unique violation → `409 SLOT_TAKEN`, outbox events, concurrency + idempotency tests.

**Phase 3 — Queue**
- **3.1** State machine + unit tests, token generator, check-in.
- **3.2** Position/ETA, `/queue/me`, `/queue/provider/:id`.
- **3.3** call-next (SKIP LOCKED) + all actions + concurrency/lifecycle tests.

**Phase 4 — Async & Analytics**
- **4.1** Redis in `lib/redis.ts`; queues `outbox-relay`, `notifications`, `maintenance`; relay polls PENDING (batch 50, SKIP LOCKED, retry, FAILED after 5); `worker.ts`.
- **4.2** Notification worker (`Notifier` interface + DB implementation), notification endpoints, auto no-show + 30-min reminder jobs.
- **4.3** Analytics (avg wait, avg service, no-show rate, throughput/hour) + `seed:demo` busy-day data.

**Phase 5 — Frontend**
- **5.1** API client, AuthContext (role + providerId), route guards, remove MockCheckout.
- **5.2** Wire all screens; write `docs/e2e-checklist.md`.

**Phase 6 — DevOps** (only after Phases 0–5 are ✅)
- **6.1** Authorization audit of every route; `/metrics` (http latency histogram, waiting entries per provider, outbox pending, job counts); `/health` 503 when dependencies down.
- **6.2** Multi-stage non-root Dockerfiles (backend runs `prisma migrate deploy` on start; worker = same image, different command; frontend = nginx + `/api` proxy, `/metrics` blocked). `infra/docker-compose.yml`: postgres, redis, backend, worker, frontend with healthchecks. Done when the full flow works at `http://localhost:8080`.
- **6.3** `.github/workflows/ci.yml`: Postgres + Redis services; backend lint/typecheck/test/build; frontend lint/build; docker build.
- **6.4** `Jenkinsfile`: Checkout → Install → Lint → Test → Build → Docker Build → Deploy (main only, `infra/deploy.sh` with smoke test + rollback). Add `infra/jenkins/` compose + README.
- **6.5** `infra/docker-compose.monitoring.yml`: Prometheus, Grafana (provisioned dashboard), node-exporter, cAdvisor; alerts for service down, 5xx rate, outbox backlog.
- **6.6** `docs/jira-import.csv` (Epic = phase, Story = task), `docs/DEVOPS_EVIDENCE.md` mapping coursework experiments (Git, Docker, Compose, Jenkins CI, Jenkins CD, Jira, Monitoring) to files + demo commands, final README with run steps and demo logins.

## 8. Prompts

**Start / full run**
```
Read QUEUELESS_CONTEXT.md. Complete every task in Section 7 in order.
For each task: short analysis, implement fully, write required tests, run lint/typecheck/test/build and fix failures, update Section 6, commit on a task branch (conventional message), continue automatically.
Follow Sections 1 and 3. Never edit frontend index.css/App.css. Never commit secrets.
If the spec is silent, choose the simplest option, log it in Section 5, continue.
Stop only when all tasks are ✅, or a blocker survives 3 fix attempts (record it and stop).
If context runs low, finish the current task, update Section 6, commit, and tell me to resume.
Final report: tasks done, test counts + coverage, decisions logged, anything unverified (no Docker/SSH/Jenkins), commands to run the stack, demo logins.
```

**Resume**
```
Read QUEUELESS_CONTEXT.md and resume from Section 6 with the same rules. Continue until done.
```

**One task**
```
Read QUEUELESS_CONTEXT.md. Do task <X.Y> only, update Section 6, stop.
```
