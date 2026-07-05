# simplek8s

Kubernetes fundamentals using YAML manifests — Pods, Deployments, and Services.

Part of the [docler-k8s](../README.md) learning repository.

## What It Does

Deploys a pre-built React client image (`stephengrider/multi-client`) to a local Kubernetes cluster and exposes it via a NodePort Service.

## Project Structure

```
simplek8s/
├── client-pod.yaml         # Single Pod definition
├── client-deployment.yaml  # Deployment with replica management
└── client-node-port.yaml   # NodePort Service for external access
```

## Prerequisites

- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- A running Kubernetes cluster ([Minikube](https://minikube.sigs.k8s.io/docs/start/), [Docker Desktop Kubernetes](https://docs.docker.com/desktop/features/kubernetes/), or similar)

Verify your cluster is reachable:

```bash
kubectl cluster-info
```

## Deploy

### Option 1: Pod (single instance)

```bash
kubectl apply -f client-pod.yaml
kubectl apply -f client-node-port.yaml
```

### Option 2: Deployment (recommended)

A Deployment manages Pod replicas and handles restarts:

```bash
kubectl apply -f client-deployment.yaml
kubectl apply -f client-node-port.yaml
```

## Access the App

The NodePort Service maps:

| Setting | Value |
|---------|-------|
| Service port | 3050 |
| Target (container) port | 3000 |
| NodePort | 31515 |

Open [http://localhost:31515](http://localhost:31515) (Docker Desktop) or use your cluster's node IP with port 31515.

```bash
# Check service details
kubectl get services
kubectl get pods
```

## Clean Up

```bash
kubectl delete -f client-node-port.yaml
kubectl delete -f client-deployment.yaml   # or client-pod.yaml
```

## Manifest Breakdown

### Pod (`client-pod.yaml`)

The simplest K8s object — one container running one image. Labels (`component: web`) let Services find the Pod.

### Deployment (`client-deployment.yaml`)

Adds replica management and rolling updates. The `selector.matchLabels` must match the Pod template labels so the Deployment knows which Pods it owns.

### NodePort Service (`client-node-port.yaml`)

Exposes the app outside the cluster by opening a port on every node. The `selector` matches Pods with `component: web`.

## Key Concepts

- **Pod** — Smallest deployable unit; one or more containers sharing a network
- **Deployment** — Declarative replica management with self-healing
- **Service** — Stable network endpoint that routes traffic to matching Pods
- **NodePort** — Exposes a Service on a static port on each cluster node
- **Labels & selectors** — Key-value pairs that connect Services to Pods

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Pod stuck in `ImagePullBackOff` | Check image name and network access: `kubectl describe pod <name>` |
| Cannot reach NodePort | Confirm the Service is applied and the port matches: `kubectl get svc` |
| Pod not selected by Service | Verify labels match between Pod template and Service selector |
