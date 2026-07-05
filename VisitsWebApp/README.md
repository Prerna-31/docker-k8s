# VisitsWebApp

A visit counter web application that demonstrates **Docker Compose** and **multi-container networking**. Each page load increments a counter stored in Redis and displays the current count.

Part of the [docler-k8s](../README.md) learning repository.

## What It Does

| Route | Method | Response |
|-------|--------|----------|
| `/`   | GET    | `Number of visits is <count>` |

Every request reads the current visit count from Redis, returns it, then increments the counter.

## Architecture

```
┌──────────────┐     Docker network      ┌──────────────┐
│   node-app   │ ──────────────────────► │ redis-server │
│  (Express)   │   host: redis-server    │   (Redis)    │
│  port 8081   │   port 6379             │              │
└──────────────┘                         └──────────────┘
       ▲
       │ localhost:4001
       │
   Your browser
```

Two services defined in `docker-compose.yml`:

- **redis-server** — Official Redis image; stores the visit count
- **node-app** — Express app built from the local `Dockerfile`; connects to Redis by service name

## Project Structure

```
VisitsWebApp/
├── Dockerfile
├── docker-compose.yml
├── index.js
└── package.json
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Run With Docker Compose

From the `VisitsWebApp` directory:

```bash
docker-compose up --build
```

Open [http://localhost:4001](http://localhost:4001) and refresh the page — the visit count increases each time.

Stop the services:

```bash
docker-compose down
```

## Run Locally (Without Docker)

Requires a running Redis instance on `localhost:6379`. Update `index.js` to use `host: 'localhost'` instead of `host: 'redis-server'`.

```bash
npm install
npm start
```

The server listens on port **8081**.

## Key Concepts

- **Service discovery** — Containers on the same Compose network reach each other by service name (`redis-server`), not `localhost`.
- **Port mapping** — `4001:8081` maps host port 4001 to container port 8081.
- **Restart policy** — `restart: always` on `node-app` keeps the app running if it crashes.
- **Build context** — `build: .` tells Compose to build the image from the local `Dockerfile`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED` to Redis | Ensure both services are up: `docker-compose ps` |
| Port 4001 in use | Change the host port in `docker-compose.yml`, e.g. `"5001:8081"` |
| Count resets on restart | Expected — Redis data is ephemeral unless you add a volume |
