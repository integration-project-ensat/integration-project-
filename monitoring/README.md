# Monitoring

This folder contains the local monitoring stack for the project.

## Services

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`
- Node Exporter: `http://localhost:9100`
- cAdvisor: `http://localhost:8084`

## Default Grafana Login

- User: `admin`
- Password: `admin123`

You can override these values with:

```env
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your-password
```

## Start Monitoring

From the repository root:

```bash
docker compose up -d prometheus grafana node-exporter cadvisor
```

To start the full stack:

```bash
docker compose up -d --build
```

## Check Targets

Open Prometheus:

```text
http://localhost:9090/targets
```

Expected targets:

- `prometheus`
- `node-exporter`
- `cadvisor`

## Stop Monitoring

```bash
docker compose stop prometheus grafana node-exporter cadvisor
```
