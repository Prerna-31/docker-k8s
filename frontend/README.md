# Frontend

A [Create React App](https://create-react-app.dev/) project configured for **Docker-based development** with volume mounts and hot reload.

Part of the [docler-k8s](../README.md) learning repository.

## What It Does

A standard React starter app. The focus of this project is not the UI itself — it is learning how to run a frontend dev server inside Docker with live code syncing.

## Project Structure

```
frontend/
├── Dockerfile          # Multi-stage production build (Node → Nginx)
├── Dockerfile.dev      # Development image with hot reload
├── docker-compose.yml  # Dev and test services
├── src/
│   └── App.js
└── package.json
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Run in Development (Docker Compose)

From the `frontend` directory:

```bash
docker-compose up --build web
```

Open [http://localhost:3000](http://localhost:3000). Edit `src/App.js` on your host machine — changes appear in the browser without rebuilding the image.

## Run Tests in Docker

```bash
docker-compose up --build tests
```

## Production Build

The production `Dockerfile` uses a multi-stage build:

1. **Stage 1 (builder)** — Installs dependencies and runs `npm run build`
2. **Stage 2 (nginx)** — Serves the static `build/` output via Nginx on port 80

```bash
docker build -t frontend-prod .
docker run -p 8080:80 frontend-prod
```

## How Dev Volumes Work

From `docker-compose.yml`:

```yaml
volumes:
  - /app/node_modules   # Preserve container's node_modules
  - .:/app              # Sync host source code into the container
```

The anonymous volume for `/app/node_modules` prevents your host's (possibly empty) `node_modules` from overwriting the container's installed packages. Your source files sync via the `.:/app` bind mount.

## Key Concepts

- **Bind mounts** — Host directory mapped into the container for live editing
- **Anonymous volumes** — Protect container-specific directories from bind mount overwrites
- **Multi-stage builds** — Separate build and runtime stages for smaller production images
- **Dev vs. prod Dockerfiles** — `Dockerfile.dev` for development; `Dockerfile` for production

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Changes not reflecting | Ensure the `web` service is running and volumes are mounted: `docker-compose config` |
| `node_modules` errors after mount | The anonymous volume should handle this; rebuild with `docker-compose up --build` |
| Port 3000 in use | Change the port mapping in `docker-compose.yml`, e.g. `"3001:3000"` |
