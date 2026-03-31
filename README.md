https://www.youtube.com/watch?v=hxFU52no2EQ

# Lecture Poll

Real-time audience polling for lectures. Speaker creates a session, shares a QR code, collects anonymous responses at the start and end of lecture, and views live statistics on a projector.

## Tech Stack

- **Backend:** NestJS + Drizzle ORM + PostgreSQL
- **Frontend:** Vue 3 (Composition API, `<script setup>`) + Vite
- **Real-time:** Socket.IO (WebSockets)
- **Language:** TypeScript everywhere
- **Styling:** Tailwind CSS
- **Package manager:** pnpm
- **Monorepo:** pnpm workspaces

## Prerequisites

- Node.js 20+
- pnpm
- Docker

## Quick Start

```bash
git clone <repo-url> && cd lecture-poll
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:push
pnpm dev
```

## URLs

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| API      | http://localhost:3000  |

## How It Works

1. **Create** — Speaker creates a lecture, gets a unique code & admin panel
2. **Share QR** — Audience scans QR code to join on their phones
3. **Start Poll** — Speaker starts pre-lecture survey (2 scale questions)
4. **Lecture** — Lecture proceeds
5. **End Poll** — Speaker starts post-lecture survey (2 scale + 1 single choice + 1 rating)
6. **See Results** — Comparison stats on projector: before vs after with delta arrows, pie charts

## Project Structure

```
lecture-poll/
├── package.json              # root workspace scripts
├── pnpm-workspace.yaml
├── docker-compose.yml        # local PostgreSQL
├── .env.example
├── packages/
│   └── shared/               # shared types/enums/DTOs
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── db/           # schema, connection, seed
│   │   │   ├── lectures/     # CRUD + phase control
│   │   │   ├── responses/    # vote submission
│   │   │   ├── stats/        # aggregated statistics + CSV export
│   │   │   └── gateway/      # Socket.IO real-time events
│   │   └── drizzle.config.ts
│   └── web/                  # Vue 3 frontend
│       └── src/
│           ├── views/        # CreateLecture, AdminDashboard, AudienceVote, PublicStats, AdminStats
│           ├── components/   # ScaleQuestion, SingleChoiceQuestion, QrCode, BarChart, PieChart, ComparisonChart
│           ├── composables/  # useApi (fetch wrapper)
│           └── stores/       # Pinia socket store
```

## Production (Neon)

For production deployment with Neon PostgreSQL:

1. Create a Neon project at https://neon.tech
2. Update `DATABASE_URL` in `.env` with your Neon connection string
3. Swap the pg driver in `apps/api/src/db/connection.ts` to `@neondatabase/serverless`
4. Run `pnpm db:push` to apply schema to Neon
