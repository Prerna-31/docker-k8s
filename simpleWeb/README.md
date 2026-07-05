# SimpleWeb

A minimal Node.js web application used to learn **Docker containerization**. The app is intentionally small so you can focus on how the code is packaged, built, and run inside a container.

## What This Project Does

SimpleWeb runs a single HTTP server that responds with a plain-text greeting on the root route. It exists to demonstrate the full Docker workflow: write an app, define a `Dockerfile`, build an image, and run a container.

| Route | Method | Response        |
|-------|--------|-----------------|
| `/`   | GET    | `Bye There`     |

The server listens on **port 8080** inside the container.

## Tech Stack

- **Node.js** (via `node:14-alpine` base image)
- **Express** 4.x — lightweight HTTP server

## Project Structure

```
simpleweb/
├── Dockerfile       # Instructions to build the Docker image
├── index.js         # Express server entry point
├── package.json     # Dependencies and start script
└── package-lock.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) (optional — only needed if you want to run locally without Docker)
- [Docker](https://docs.docker.com/get-docker/) installed and running

## Run Locally (Without Docker)

From the `simpleweb` directory:

```bash
npm install
npm start
```

The server starts on port **8080**. Open [http://localhost:8080](http://localhost:8080) in your browser or run:

```bash
curl http://localhost:8080
```

Expected output:

```
Bye There
```

## Run With Docker

### 1. Build the image

From the `simpleweb` directory:

```bash
docker build -t simpleweb .
```

This command:

1. Uses `node:14-alpine` as the base image
2. Sets the working directory to `/usr/app`
3. Installs npm dependencies from `package.json`
4. Copies the application source into the image
5. Sets the default command to `npm start`

### 2. Run the container

Map port 8080 on your machine to port 8080 in the container:

```bash
docker run -p 8080:8080 simpleweb
```

Visit [http://localhost:8080](http://localhost:8080) or run:

```bash
curl http://localhost:8080
```

### 3. Stop the container

Press `Ctrl+C` in the terminal where the container is running, or stop it by container ID:

```bash
docker ps          # find the container ID
docker stop <id>
```

## How the Dockerfile Works

| Step | Instruction | Purpose |
|------|-------------|---------|
| 1 | `FROM node:14-alpine` | Start from a lightweight Node.js image |
| 2 | `WORKDIR /usr/app` | Set the working directory inside the container |
| 3 | `COPY ./package.json ./` | Copy dependency manifest first (better layer caching) |
| 4 | `RUN npm install` | Install dependencies inside the image |
| 5 | `COPY ./ ./` | Copy the rest of the application code |
| 6 | `CMD ["npm", "start"]` | Run the server when the container starts |

## Key Concepts Demonstrated

- **Container vs. host** — The app listens on port 8080 *inside* the container; `-p 8080:8080` exposes it on your machine.
- **Image layers** — Copying `package.json` before the rest of the source lets Docker cache the `npm install` step when only app code changes.
- **Immutable images** — The same image runs the same way on any machine with Docker installed.

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| `Cannot connect to localhost:8080` | Container not running or wrong port mapping | Check `docker ps` and use `-p 8080:8080` |
| `port is already allocated` | Something else is using port 8080 | Stop the other process or map a different host port, e.g. `-p 3000:8080` |
| `docker: command not found` | Docker not installed or not in PATH | Install Docker Desktop and ensure it is running |

## License

This project is part of a Docker-k8s learning repository. Feel free to explore, fork, and use it for learning purposes.
