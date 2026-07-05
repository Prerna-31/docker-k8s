# docler-k8s

A hands-on learning repository for **Docker** and **Kubernetes**. Each project builds on the last — from a single containerized Node app to a full multi-service stack deployed on Kubernetes and AWS.

This repo is designed for anyone who wants to understand how applications are packaged, orchestrated, and deployed in the real world.

## Learning Path

Work through the projects in order. Each one introduces new concepts while reusing patterns from earlier steps.

| # | Project | Concepts Covered |
|---|---------|------------------|
| 1 | [simpleweb](./simpleweb) | Dockerfile basics, building images, port mapping |
| 2 | [redis_image](./redis_image) | Custom base images, Alpine packages |
| 3 | [VisitsWebApp](./VisitsWebApp) | Docker Compose, multi-container networking, Redis |
| 4 | [frontend](./frontend) | Dev containers, volume mounts, hot reload |
| 5 | [simplek8s](./simplek8s) | Pods, Deployments, Services, NodePort |
| 6 | [multiContainer_complex](./multiContainer_complex) | Full stack K8s, Skaffold, Ingress, TLS |
| 7 | [multiContainer_complex_EBS](./multiContainer_complex_EBS) | Nginx reverse proxy, AWS Elastic Beanstalk |

## Repository Structure

```
docler-k8s/
├── simpleweb/                  # Minimal Express app in a single Docker container
├── redis_image                 # Custom Redis image built from Alpine Linux
├── VisitsWebApp/               # Visit counter app with Redis (Docker Compose)
├── frontend/                   # React app with Docker dev workflow
├── simplek8s/                  # Kubernetes manifests for a basic React client
├── multiContainer_complex/     # Fibonacci calculator — full K8s deployment
└── multiContainer_complex_EBS/ # Same Fib app — AWS EBS + Nginx deployment
```

## Prerequisites

| Tool | Used In | Install |
|------|---------|---------|
| [Docker](https://docs.docker.com/get-docker/) | All projects | Required |
| [Docker Compose](https://docs.docker.com/compose/install/) | VisitsWebApp, frontend, multiContainer_complex_EBS | Required |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | simplek8s, multiContainer_complex | Required for K8s projects |
| [Minikube](https://minikube.sigs.k8s.io/docs/start/) or Docker Desktop K8s | simplek8s, multiContainer_complex | Local cluster |
| [Skaffold](https://skaffold.dev/docs/install/) | multiContainer_complex | Local K8s dev loop |
| AWS account | multiContainer_complex_EBS | Production deployment only |

## Quick Start

Pick a project and follow its README:

```bash
git clone https://github.com/<your-username>/docler-k8s.git
cd docler-k8s

# Example: run the simplest project
cd simpleweb
docker build -t simpleweb .
docker run -p 8080:8080 simpleweb
```

## Architecture Overview

The most complex project (`multiContainer_complex`) ties everything together:

```
                    ┌─────────────┐
                    │   Ingress   │  (TLS + routing)
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌───────▼───────┐
       │   Client    │          │    Server     │
       │   (React)   │          │   (Express)   │
       └─────────────┘          └───┬───────┬───┘
                                    │       │
                              ┌─────▼─┐ ┌───▼────┐
                              │ Redis │ │Postgres│
                              └───────┘ └───┬────┘
                                            │
                                      ┌─────▼─────┐
                                      │  Worker   │
                                      │ (Fib calc)│
                                      └───────────┘
```

**Flow:** The user submits a Fibonacci index via the React client. The Express server stores the index in Postgres and publishes a message to Redis. The worker subscribes, calculates the result, and writes it back to Redis. The client reads and displays both stored indexes and calculated values.

## Project Summaries

### [simpleweb](./simpleweb)

A minimal Express server that returns `Bye There` on `GET /`. Used to learn Dockerfile structure, image layers, and container port mapping.

### [redis_image](./redis_image)

A one-file Dockerfile that builds a custom Redis image on Alpine Linux — an introduction to extending base images with `RUN apk add`.

### [VisitsWebApp](./VisitsWebApp)

A visit counter backed by Redis, orchestrated with Docker Compose. Two services (`redis-server` and `node-app`) communicate over Docker's internal network.

### [frontend](./frontend)

A Create React App project configured for Docker-based development. Uses volume mounts so code changes on your host are reflected instantly inside the container.

### [simplek8s](./simplek8s)

Kubernetes fundamentals using YAML manifests: a Pod, a Deployment with replicas, and a NodePort Service to expose the app outside the cluster.

### [multiContainer_complex](./multiContainer_complex)

The capstone Kubernetes project. Five services (client, server, worker, Redis, Postgres) with:

- Development manifests in `k8s-dev/` and production manifests in `k8s/`
- [Skaffold](https://skaffold.dev/) for local build-and-deploy with live sync
- Nginx Ingress with TLS via cert-manager and Let's Encrypt
- Travis CI pipeline for automated builds

### [multiContainer_complex_EBS](./multiContainer_complex_EBS)

The same Fibonacci app deployed to **AWS Elastic Beanstalk** using a multi-container Docker setup. Nginx acts as a reverse proxy, routing `/` to the React client and `/api` to the Express server.

## Technologies

- **Runtime:** Node.js, Express
- **Frontend:** React (Create React App)
- **Data stores:** Redis, PostgreSQL
- **Containers:** Docker, Docker Compose
- **Orchestration:** Kubernetes, Skaffold
- **Proxy / Ingress:** Nginx
- **Cloud:** AWS Elastic Beanstalk, Travis CI

## Contributing

This is a personal learning repository. Feel free to fork, explore, and adapt the projects for your own learning. Issues and pull requests are welcome.

## License

Open for learning and educational use. See individual project folders for application-specific details.
