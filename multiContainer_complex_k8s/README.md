# multiContainer_complex

A full-stack **Fibonacci calculator** deployed on Kubernetes. Five services work together: React client, Express API, background worker, Redis, and PostgreSQL.

Part of the [docler-k8s](../README.md) learning repository.

## What It Does

1. User enters a Fibonacci index in the React UI
2. Express server saves the index to Postgres and publishes to Redis
3. Worker subscribes to Redis, calculates the Fibonacci number, and stores the result
4. Client displays all submitted indexes and their calculated values

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server health check |
| `/values/all` | GET | All indexes stored in Postgres |
| `/values/current` | GET | Calculated values from Redis |
| `/values` | POST | Submit a new index `{ "index": 5 }` |

Indexes above 40 are rejected with HTTP 422.

## Architecture

```
                    ┌─────────────┐
                    │   Ingress   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌───────▼───────┐
       │   Client    │          │    Server     │
       │   (React)   │          │   (Express)   │
       │  :3000      │          │    :5000      │
       └─────────────┘          └───┬───────┬───┘
                                    │       │
                              ┌─────▼─┐ ┌───▼────┐
                              │ Redis │ │Postgres│
                              └───────┘ └───┬────┘
                                            │
                                      ┌─────▼─────┐
                                      │  Worker   │
                                      └───────────┘
```

## Project Structure

```
multiContainer_complex/
├── client/           # React frontend (Fibonacci UI)
├── server/           # Express API
├── worker/           # Redis subscriber — calculates Fibonacci numbers
├── k8s-dev/          # Kubernetes manifests for local development
├── k8s/              # Production manifests (Ingress, TLS, cert-manager)
├── skaffold.yaml     # Local dev: build, sync, deploy
├── deploy.sh         # Production deploy script
└── .travis.yml       # CI pipeline
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Local Kubernetes cluster (Docker Desktop K8s or Minikube)
- [Skaffold](https://skaffold.dev/docs/install/) (for local development)
- [Ingress NGINX Controller](https://kubernetes.github.io/ingress-nginx/deploy/) (for Ingress routing)

## Local Development With Skaffold

Skaffold builds images, syncs file changes into running containers, and applies K8s manifests:

```bash
cd multiContainer_complex
skaffold dev
```

Skaffold watches `client/`, `server/`, and `worker/` for changes. JS and CSS file edits sync instantly; other changes trigger a rebuild and redeploy.

Access the app via the Ingress address shown by Skaffold, or port-forward:

```bash
kubectl port-forward svc/client-cluster-ip-service 3000:3000
```

## Manual Kubernetes Deploy (Dev)

```bash
kubectl apply -f k8s-dev/
```

## Production Deploy

The `deploy.sh` script builds production images, tags them with a Git SHA, pushes to Docker Hub, and applies production manifests:

```bash
export SHA=$(git rev-parse HEAD)
./deploy.sh
```

Production manifests in `k8s/` include:

- **Ingress** with Nginx — routes `/` to client, `/api` to server
- **TLS** via cert-manager and Let's Encrypt
- **PersistentVolumeClaim** for Postgres data

## Services

| Service | Port | Role |
|---------|------|------|
| client | 3000 | React UI |
| server | 5000 | Express REST API |
| worker | — | Background Fibonacci calculator |
| redis | 6379 | Pub/sub and result cache |
| postgres | 5432 | Persistent index storage |

## Key Concepts

- **Microservices** — Each concern (UI, API, computation, cache, storage) runs in its own container
- **Pub/sub pattern** — Server publishes to Redis; worker subscribes and processes asynchronously
- **ClusterIP vs. NodePort vs. Ingress** — Internal service discovery vs. node-level exposure vs. HTTP routing with TLS
- **Skaffold sync** — Fast inner dev loop without full image rebuilds
- **Persistent volumes** — Postgres data survives Pod restarts

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Pods in `CrashLoopBackOff` | Check logs: `kubectl logs <pod-name>` — often Redis/Postgres not ready |
| Skaffold image pull errors | Ensure the before-deploy hook in `skaffold.yaml` runs (Docker Desktop K8s) |
| Ingress not routing | Verify Ingress controller is installed: `kubectl get ingressclass` |
| Submit fails in UI | Confirm postgres and server pods are running: `kubectl get pods` |
