# Hindsight

Incident postmortem tool for small engineering teams. Log incidents, build timelines, document contributing factors and action items, then generate a structured postmortem with AI.

**Live:** https://hindsight-git-master-bills-projects-1cd88e02.vercel.app

---

## What it does

After an incident is resolved, engineers use Hindsight to reconstruct what happened. They log the incident, add timeline events in chronological order, categorize contributing factors (people, process, technology, environment), assign action items with owners, then generate a postmortem document. The AI generation uses all four data sets as structured context, producing a specific, accurate postmortem rather than a generic template.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Database | PostgreSQL (raw SQL, no ORM) |
| Auth | JWT, bcrypt |
| AI | Anthropic Claude API |
| Infrastructure | Docker, Docker Compose |
| CI | GitHub Actions |
| Deployment | Railway (API + DB), Vercel (client) |

---

## Architecture

Decoupled Express API and Vite SPA — deliberately not Next.js. The frontend is a pure client-side React app with no server-side rendering, which is appropriate for a tool that requires authentication on every route and has no SEO requirements. The API is a standalone Express service that can be deployed independently or self-hosted.

---

## Schema

```
users
  id, email, password_hash, display_name, role, created_at

incidents
  id, title, severity (P1–P4), status (draft|review|published)
  summary, started_at, detected_at, resolved_at
  created_by → users.id, created_at, updated_at

timeline_events
  id, incident_id → incidents.id
  occurred_at, description
  event_type (detection|action|escalation|resolution|other)
  created_by → users.id, created_at

contributing_factors
  id, incident_id → incidents.id
  category (people|process|technology|environment)
  description, created_at

action_items
  id, incident_id → incidents.id
  title, description, owner, due_date
  status (open|in_progress|done)
  created_at, updated_at

postmortems
  id, incident_id → incidents.id (unique — one per incident)
  content (AI-generated narrative)
  generated_at, reviewed_by → users.id, published_at
```

`updated_at` on `incidents` and `action_items` is maintained by a PostgreSQL trigger function, not application code.

---

## Running locally

### Docker (recommended)

```bash
git clone https://github.com/Lakonas/hindsight.git
cd hindsight
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
docker compose up --build
```

App runs at `http://localhost:5173`. The Postgres container seeds itself from `api/db/schema.sql` on first run.

> **WSL note:** Local Postgres typically occupies port 5433 on WSL. The Compose file maps the container to port 5434 to avoid the conflict.

### Manual

**API**
```bash
cd api
npm install
# Create a .env file — see .env.example
npm run dev
```

**Client**
```bash
cd client
npm install
npm run dev
```

Requires a running Postgres instance. Run `psql -f api/db/schema.sql` against your database to initialize the schema.

---

## CI

GitHub Actions runs the Jest + Supertest test suite on every push to `master`. Tests run against a Postgres 16 service container — no mocking.

---

## API

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/incidents | List incidents |
| POST | /api/incidents | Create incident |
| GET | /api/incidents/:id | Get incident |
| PATCH | /api/incidents/:id | Update incident |
| GET | /api/incidents/:id/timeline | List timeline events |
| POST | /api/incidents/:id/timeline | Add timeline event |
| GET | /api/incidents/:id/factors | List contributing factors |
| POST | /api/incidents/:id/factors | Add contributing factor |
| GET | /api/incidents/:id/actions | List action items |
| POST | /api/incidents/:id/actions | Add action item |
| PATCH | /api/incidents/:id/actions/:actionId | Update action item |
| GET | /api/postmortems/:incidentId | Get postmortem |
| POST | /api/postmortems/:incidentId/generate | Generate postmortem with AI |

All routes except `/api/auth/*` require a `Bearer` token in the `Authorization` header.

---

## Self-hosting

The full stack is containerized. Any machine with Docker installed can run Hindsight:

```bash
docker compose up --build
```
