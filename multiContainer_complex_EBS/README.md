# multiContainer_complex_EBS

The same **Fibonacci calculator** from [multiContainer_complex](../multiContainer_complex), deployed to **AWS Elastic Beanstalk** using a multi-container Docker setup with Nginx as a reverse proxy.

Part of the [docler-k8s](../README.md) learning repository.

## What It Does

Identical application logic to `multiContainer_complex`:

- React client for submitting Fibonacci indexes
- Express server for API and Postgres persistence
- Worker for async Fibonacci calculation via Redis pub/sub

The difference is the **deployment target** — AWS EBS instead of Kubernetes.

## Architecture

```
                    ┌─────────────┐
                    │    Nginx    │  :80 (public)
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌───────▼───────┐
       │   Client    │          │    Server     │
       │   (React)   │          │   (Express)   │
       │  :3000      │          │    :5000      │
       └─────────────┘          └───────┬───────┘
                                        │
                                  ┌─────▼─────┐
                                  │  Worker   │
                                  └───────────┘
```

Nginx routes:

| Path | Destination |
|------|-------------|
| `/` | React client (`client:3000`) |
| `/api/*` | Express server (`api:5000`), with `/api/` prefix stripped |
| `/sockjs-node` | WebSocket proxy to client (dev hot reload) |

## Project Structure

```
multiContainer_complex_EBS/
├── client/                 # React frontend
├── server/                 # Express API
├── worker/                 # Fibonacci worker
├── nginx/
│   ├── Dockerfile          # Production Nginx image
│   ├── Dockerfile.dev      # Dev Nginx with WebSocket support
│   └── default.conf        # Reverse proxy rules
├── docker-compose.yml      # Local development (all 5 services)
├── docker-compose-prod.yml # Production-like compose (pre-built images)
├── Dockerrun.aws.json      # AWS EBS multi-container definition
└── .travis.yml             # CI: build, test, deploy
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- AWS account with Elastic Beanstalk configured (for production deploy only)

## Local Development

Start all services (Postgres, Redis, server, client, worker, Nginx):

```bash
docker-compose up --build
```

Open [http://localhost:3050](http://localhost:3050).

Source code is volume-mounted for hot reload across client, server, and worker.

## Production Compose

Uses pre-built images from Docker Hub with environment variables for external Redis and Postgres:

```bash
docker-compose -f docker-compose-prod.yml up
```

Set required environment variables (`REDIS_HOST`, `PGHOST`, etc.) before running.

## AWS Elastic Beanstalk Deploy

`Dockerrun.aws.json` defines the multi-container setup for EBS:

| Container | Image | Role |
|-----------|-------|------|
| client | `prerna31/multi-client` | React UI |
| server | `prerna31/multi-server` | Express API |
| worker | `prerna31/multi-worker` | Fibonacci calculator |
| nginx | `prerna31/multi-nginx` | Reverse proxy (port 80) |

Nginx is marked `essential: true` and is the only container with a public port mapping.

Deploy via Travis CI (`.travis.yml`) or manually:

1. Build and push images to Docker Hub
2. Upload `Dockerrun.aws.json` to an EBS environment

## Nginx Configuration

From `nginx/default.conf`:

```nginx
location / {
    proxy_pass http://client;
}

location /api {
    rewrite /api/(.*) /$1 break;
    proxy_pass http://api;
}
```

The `/api` rewrite strips the prefix so Express receives `/values` instead of `/api/values`.

## Key Concepts

- **Reverse proxy** — Nginx terminates HTTP and routes to internal services by hostname
- **Multi-container Docker on EBS** — `Dockerrun.aws.json` v2 defines container links and port mappings
- **Dev vs. prod compose** — Volume mounts and dev Dockerfiles locally; pre-built images in production
- **Container links** — EBS `links` in Dockerrun connect Nginx to client and server by hostname

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 502 from Nginx | Check that client and server containers are running |
| API calls fail | Verify `/api` rewrite in `default.conf` and server hostname is `api` |
| WebSocket errors in dev | Ensure `/sockjs-node` location block is present in Nginx config |
| EBS deploy fails | Confirm all four images exist on Docker Hub and memory limits are sufficient |
