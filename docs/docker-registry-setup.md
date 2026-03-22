# Docker Registry Setup

This document describes how to set up and maintain the local Docker registry for base images.

## Problem

Docker Hub has rate limits for unauthenticated pulls. To avoid this issue during CI/CD builds, we maintain a local Docker registry with copies of our base images.

## Solution

All Dockerfiles use images from our local registry:
- `docker-registry.docker-registry.svc.cluster.local:5000/node:20-alpine`
- `docker-registry.docker-registry.svc.cluster.local:5000/nginx:alpine`

## Initial Setup (One-time)

### 1. Start port-forward to local registry

```bash
export KUBECONFIG=/path/to/your/kubeconfig
kubectl port-forward -n docker-registry svc/docker-registry 5000:5000
```

### 2. Pull and push base images

In a separate terminal:

```bash
# Node image
docker pull node:20-alpine
docker tag node:20-alpine localhost:5000/node:20-alpine
docker push localhost:5000/node:20-alpine

# Nginx image
docker pull nginx:alpine
docker tag nginx:alpine localhost:5000/nginx:alpine
docker push localhost:5000/nginx:alpine
```

### 3. Verify images are in registry

```bash
# List all repositories
curl http://localhost:5000/v2/_catalog

# List tags for specific image
curl http://localhost:5000/v2/node/tags/list
curl http://localhost:5000/v2/nginx/tags/list
```

Expected output:
```json
{"repositories":["nginx","node"]}
```

## Automated Sync

A CronJob runs daily at 2 AM to sync base images from Docker Hub to the local registry.

### Deploy the CronJob

The CronJob is defined in `k8s/docker-registry-sync-cronjob.yaml`.

**Important:** Before deploying, update the Docker Hub credentials secret or configure Jenkins to inject them:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dockerhub-credentials
  namespace: ai-lecture
type: Opaque
stringData:
  username: "your-dockerhub-username"
  token: "your-dockerhub-token"
```

Deploy:

```bash
kubectl apply -f k8s/docker-registry-sync-cronjob.yaml
```

### Manually trigger sync

```bash
kubectl create job --from=cronjob/docker-registry-sync manual-sync-$(date +%s) -n ai-lecture
```

### Monitor sync job

```bash
# Watch job status
kubectl get jobs -n ai-lecture -w

# View logs
kubectl logs -n ai-lecture -l job-name=<job-name> -f
```

## Troubleshooting

### Rate limit errors during build

If you see `TOOMANYREQUESTS` errors, the images might not be in the local registry yet:

1. Verify images exist: `curl http://localhost:5000/v2/_catalog`
2. If missing, perform initial setup (see above)
3. Check CronJob is running: `kubectl get cronjob -n ai-lecture`

### CronJob fails

```bash
# Check CronJob events
kubectl describe cronjob docker-registry-sync -n ai-lecture

# Check recent job logs
kubectl logs -n ai-lecture -l job-name=docker-registry-sync-<timestamp>
```

Common issues:
- Docker Hub credentials not configured
- Docker socket not accessible (hostPath mount)
- Network connectivity to Docker Hub

## Adding New Base Images

To add a new base image to the sync:

1. Update `k8s/docker-registry-sync-cronjob.yaml` with new image
2. Perform manual sync (see above)
3. Update Dockerfile to use the local registry path
4. Apply the updated CronJob manifest
