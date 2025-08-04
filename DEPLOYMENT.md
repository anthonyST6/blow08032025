# Seraphim Vanguards Deployment Guide

This guide provides comprehensive instructions for deploying the Seraphim Vanguards AI Governance Platform to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Cloud Deployments](#cloud-deployments)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup and Recovery](#backup-and-recovery)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Node.js 20+ (for local development)
- PostgreSQL 16+ (if not using Docker)
- Redis 7+ (if not using Docker)
- Valid Firebase project credentials
- OpenAI and/or Anthropic API keys
- SMTP credentials for email notifications

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/seraphim_vanguard
DB_USER=seraphim
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Seraphim Vanguards" <noreply@seraphim-vanguards.com>

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# Application URLs
API_URL=https://api.yourdomain.com
WS_URL=wss://api.yourdomain.com
FRONTEND_URL=https://app.yourdomain.com

# Monitoring
GRAFANA_PASSWORD=secure_admin_password
```

## Docker Deployment

### 1. Build and Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/your-org/seraphim-vanguards.git
cd seraphim-vanguards

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 2. Production Docker Compose

For production, use the extended docker-compose configuration:

```bash
# Build with production optimizations
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Scaling Services

```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Scale Redis for high availability
docker-compose up -d --scale redis=3
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace seraphim-vanguard
```

### 2. Create Secrets

```bash
# Create secret from .env file
kubectl create secret generic seraphim-secrets \
  --from-env-file=.env \
  -n seraphim-vanguard
```

### 3. Deploy Application

```yaml
# Save as k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seraphim-backend
  namespace: seraphim-vanguard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: seraphim-backend
  template:
    metadata:
      labels:
        app: seraphim-backend
    spec:
      containers:
      - name: backend
        image: seraphim-vanguard/backend:latest
        ports:
        - containerPort: 3001
        envFrom:
        - secretRef:
            name: seraphim-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: seraphim-backend
  namespace: seraphim-vanguard
spec:
  selector:
    app: seraphim-backend
  ports:
  - port: 3001
    targetPort: 3001
  type: LoadBalancer
```

```bash
# Apply deployment
kubectl apply -f k8s-deployment.yaml

# Check status
kubectl get all -n seraphim-vanguard
```

## Cloud Deployments

### AWS Deployment

#### Using AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI
docker build -t seraphim-backend ./packages/backend
docker tag seraphim-backend:latest $ECR_URI/seraphim-backend:latest
docker push $ECR_URI/seraphim-backend:latest

# Create ECS task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create service
aws ecs create-service \
  --cluster seraphim-cluster \
  --service-name seraphim-backend \
  --task-definition seraphim-backend:1 \
  --desired-count 3 \
  --launch-type FARGATE
```

#### Using AWS Elastic Beanstalk

```bash
# Initialize EB
eb init -p docker seraphim-vanguard

# Create environment
eb create seraphim-prod --envvars DATABASE_URL=$DATABASE_URL,REDIS_HOST=$REDIS_HOST

# Deploy
eb deploy
```

### Google Cloud Platform

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/$PROJECT_ID/seraphim-backend ./packages/backend

# Deploy to Cloud Run
gcloud run deploy seraphim-backend \
  --image gcr.io/$PROJECT_ID/seraphim-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL
```

### Azure Deployment

```bash
# Create resource group
az group create --name seraphim-rg --location eastus

# Create container registry
az acr create --resource-group seraphim-rg --name seraphimacr --sku Basic

# Build and push image
az acr build --registry seraphimacr --image seraphim-backend ./packages/backend

# Create container instance
az container create \
  --resource-group seraphim-rg \
  --name seraphim-backend \
  --image seraphimacr.azurecr.io/seraphim-backend:latest \
  --dns-name-label seraphim-api \
  --ports 3001
```

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Automated SSL with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com -d app.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring and Logging

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'seraphim-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Grafana Dashboards

Import the following dashboard IDs:
- Node.js Application: 11159
- PostgreSQL: 9628
- Redis: 763
- Nginx: 12708

### Log Aggregation with ELK Stack

```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - es_data:/usr/share/elasticsearch/data

  logstash:
    image: logstash:8.11.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline

  kibana:
    image: kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

## Backup and Recovery

### Database Backup

```bash
# Automated PostgreSQL backup
#!/bin/bash
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="seraphim_vanguard"

# Create backup
pg_dump -h postgres -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$TIMESTAMP.sql.gz s3://seraphim-backups/postgres/
```

### Redis Backup

```bash
# Redis backup
docker exec redis redis-cli BGSAVE
docker cp redis:/data/dump.rdb ./backups/redis/dump_$(date +%Y%m%d_%H%M%S).rdb
```

### Restore Procedures

```bash
# Restore PostgreSQL
gunzip < backup_20240124_120000.sql.gz | psql -h postgres -U $DB_USER -d $DB_NAME

# Restore Redis
docker cp dump.rdb redis:/data/dump.rdb
docker exec redis redis-cli SHUTDOWN SAVE
docker restart redis
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check PostgreSQL status
   docker-compose ps postgres
   docker-compose logs postgres
   
   # Test connection
   docker exec -it postgres psql -U seraphim -d seraphim_vanguard
   ```

2. **Redis Connection Issues**
   ```bash
   # Check Redis status
   docker exec redis redis-cli ping
   
   # Monitor Redis
   docker exec redis redis-cli monitor
   ```

3. **High Memory Usage**
   ```bash
   # Check container stats
   docker stats
   
   # Limit memory in docker-compose
   deploy:
     resources:
       limits:
         memory: 1G
   ```

4. **SSL Certificate Issues**
   ```bash
   # Test SSL
   openssl s_client -connect api.yourdomain.com:443
   
   # Renew certificates
   sudo certbot renew --force-renewal
   ```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Frontend health
curl http://localhost:3000/health

# Database health
docker exec postgres pg_isready

# Redis health
docker exec redis redis-cli ping
```

### Performance Tuning

1. **PostgreSQL Optimization**
   ```sql
   -- Increase shared buffers
   ALTER SYSTEM SET shared_buffers = '256MB';
   
   -- Optimize for SSD
   ALTER SYSTEM SET random_page_cost = 1.1;
   
   -- Reload configuration
   SELECT pg_reload_conf();
   ```

2. **Node.js Optimization**
   ```bash
   # Use PM2 for process management
   pm2 start dist/index.js -i max --name seraphim-backend
   
   # Enable cluster mode
   pm2 scale seraphim-backend 4
   ```

3. **Nginx Optimization**
   ```nginx
   # Enable caching
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g;
   
   location /api {
       proxy_cache api_cache;
       proxy_cache_valid 200 1m;
       proxy_cache_use_stale error timeout invalid_header updating;
   }
   ```

## Security Checklist

- [ ] All secrets stored in environment variables
- [ ] SSL/TLS enabled for all endpoints
- [ ] Database connections use SSL
- [ ] Regular security updates applied
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] SQL injection protection
- [ ] XSS protection headers
- [ ] Regular backups scheduled
- [ ] Monitoring alerts configured
- [ ] Incident response plan documented

## Support

For deployment support, please refer to:
- Documentation: https://docs.seraphim-vanguards.com
- Issues: https://github.com/your-org/seraphim-vanguards/issues
- Email: support@seraphim-vanguards.com