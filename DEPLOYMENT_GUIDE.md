# IPTV Streaming Server - Deployment Guide

**Complete guide for deploying the production-ready IPTV streaming server on permanent hosting platforms.**

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Railway Deployment](#railway-deployment)
3. [Render Deployment](#render-deployment)
4. [Fly.io Deployment](#flyio-deployment)
5. [Docker Deployment](#docker-deployment)
6. [systemd Service (Linux VPS)](#systemd-service-linux-vps)
7. [PM2 Process Manager](#pm2-process-manager)
8. [Post-Deployment Configuration](#post-deployment-configuration)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 16+ (for local/VPS deployment)
- Docker (for containerized deployment)
- Git (for version control)
- Account on hosting platform (Railway, Render, or Fly.io)

### Local Testing
```bash
# Clone or download the project
cd iptv-streaming-server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your channel sources

# Start server
npm start
```

Server will be available at `http://localhost:3000`

---

## Railway Deployment

**Railway** is recommended for its simplicity and automatic scaling.

### Step 1: Prepare Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial IPTV streaming server"

# Push to GitHub
git remote add origin https://github.com/your-username/iptv-streaming-server.git
git push -u origin main
```

### Step 2: Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize GitHub and select your repository
5. Railway will automatically detect the Dockerfile

### Step 3: Configure Environment Variables

In Railway dashboard:

1. Go to Variables tab
2. Add the following variables:

```
NODE_ENV = production
PORT = 3000
HOST = 0.0.0.0
CHANNEL1_SOURCE = rtsp://your-channel1-source.com/stream
CHANNEL2_SOURCE = rtsp://your-channel2-source.com/stream
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (5-10 minutes)
3. Get your permanent URL from the Railway dashboard

### Step 5: Update watch.html

Replace the `SERVER` variable in `watch.html`:

```javascript
var SERVER = "https://your-railway-app.up.railway.app";
```

---

## Render Deployment

**Render** offers free tier with automatic deployments.

### Step 1: Connect Repository

1. Go to [render.com](https://render.com)
2. Click "New +"
3. Select "Web Service"
4. Connect your GitHub repository
5. Authorize and select the repository

### Step 2: Configure Service

Fill in the following:

- **Name:** `iptv-streaming-server`
- **Environment:** `Docker`
- **Region:** Choose closest to your users
- **Branch:** `main`

### Step 3: Add Environment Variables

In the "Environment" section:

```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
CHANNEL1_SOURCE=rtsp://your-channel1-source.com/stream
CHANNEL2_SOURCE=rtsp://your-channel2-source.com/stream
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will build and deploy automatically
3. Get your URL from the service dashboard

### Step 5: Update watch.html

```javascript
var SERVER = "https://iptv-streaming-server.onrender.com";
```

---

## Fly.io Deployment

**Fly.io** provides global edge deployment with excellent performance.

### Step 1: Install Fly CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
iwr https://fly.io/install.ps1 -useb | iex
```

### Step 2: Authenticate

```bash
flyctl auth login
```

### Step 3: Initialize Project

```bash
flyctl launch
```

When prompted:
- App name: `iptv-streaming-server`
- Region: Choose closest to your users
- Dockerfile: Yes (use existing)
- Deploy now: No (we'll configure first)

### Step 4: Configure Environment

Edit `fly.toml` and add environment variables:

```toml
[env]
NODE_ENV = "production"
PORT = "3000"
HOST = "0.0.0.0"
CHANNEL1_SOURCE = "rtsp://your-channel1-source.com/stream"
CHANNEL2_SOURCE = "rtsp://your-channel2-source.com/stream"
```

### Step 5: Deploy

```bash
flyctl deploy
```

### Step 6: Get URL

```bash
flyctl info
```

Your URL will be: `https://iptv-streaming-server.fly.dev`

### Step 7: Update watch.html

```javascript
var SERVER = "https://iptv-streaming-server.fly.dev";
```

---

## Docker Deployment

### Build Image

```bash
docker build -t iptv-streaming-server:latest .
```

### Run Container

```bash
docker run -d \
  --name iptv-server \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e CHANNEL1_SOURCE="rtsp://your-channel1-source.com/stream" \
  -e CHANNEL2_SOURCE="rtsp://your-channel2-source.com/stream" \
  --restart unless-stopped \
  iptv-streaming-server:latest
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  iptv-server:
    build: .
    container_name: iptv-streaming-server
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      CHANNEL1_SOURCE: rtsp://your-channel1-source.com/stream
      CHANNEL2_SOURCE: rtsp://your-channel2-source.com/stream
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - streaming-network

networks:
  streaming-network:
    driver: bridge
```

Run with:
```bash
docker-compose up -d
```

---

## systemd Service (Linux VPS)

### Prerequisites
- Ubuntu/Debian Linux server
- SSH access
- sudo privileges
- Node.js 16+ installed

### Installation Steps

1. **Create application directory:**

```bash
sudo mkdir -p /opt/iptv-streaming-server
sudo chown $USER:$USER /opt/iptv-streaming-server
```

2. **Copy application files:**

```bash
cd /opt/iptv-streaming-server
git clone https://github.com/your-repo/iptv-streaming-server.git .
npm install --production
```

3. **Create .env file:**

```bash
cp .env.example .env
nano .env
# Edit with your channel sources
```

4. **Install systemd service:**

```bash
sudo cp iptv-streaming-server.service /etc/systemd/system/
sudo systemctl daemon-reload
```

5. **Enable and start service:**

```bash
sudo systemctl enable iptv-streaming-server
sudo systemctl start iptv-streaming-server
```

6. **Verify service is running:**

```bash
sudo systemctl status iptv-streaming-server
```

### Service Management

```bash
# Check status
sudo systemctl status iptv-streaming-server

# View logs
sudo journalctl -u iptv-streaming-server -f

# Restart service
sudo systemctl restart iptv-streaming-server

# Stop service
sudo systemctl stop iptv-streaming-server

# View last 100 lines of logs
sudo journalctl -u iptv-streaming-server -n 100
```

---

## PM2 Process Manager

### Installation

```bash
npm install -g pm2
```

### Start with PM2

```bash
cd /path/to/iptv-streaming-server
pm2 start ecosystem.config.js
```

### Save PM2 Configuration

```bash
pm2 save
```

### Enable Auto-startup on Reboot

```bash
pm2 startup
# Follow the instructions provided
```

### Process Management

```bash
# List all processes
pm2 list

# Monitor processes
pm2 monit

# View logs
pm2 logs iptv-streaming-server

# Restart process
pm2 restart iptv-streaming-server

# Stop process
pm2 stop iptv-streaming-server

# Delete process
pm2 delete iptv-streaming-server

# View process details
pm2 show iptv-streaming-server
```

---

## Post-Deployment Configuration

### 1. Update watch.html

After deployment, update the `SERVER` variable in `watch.html`:

```javascript
// Before (temporary server)
var SERVER = "https://3000-irsj5brl7a5f94ei7g76l-647352f4.us2.manus.computer";

// After (permanent server)
var SERVER = "https://your-permanent-url.com";
```

### 2. Configure Channel Sources

Update environment variables with your actual streaming sources:

```bash
# For Railway/Render/Fly.io: Update in dashboard
# For VPS/Docker: Update in .env file

CHANNEL1_SOURCE=rtsp://your-channel1-source.com/stream
CHANNEL2_SOURCE=rtsp://your-channel2-source.com/stream
```

### 3. Set Up Reverse Proxy (Optional but Recommended)

For better performance and security, use nginx:

```nginx
upstream iptv_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://iptv_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Streaming specific settings
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 86400;
    }
}
```

### 4. Enable HTTPS (SSL/TLS)

For Railway/Render/Fly.io: HTTPS is automatic

For VPS with nginx:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check server status
curl https://your-server.com/health

# Check stream statistics
curl https://your-server.com/api/stream/stats

# Check specific channel
curl https://your-server.com/api/stream/channel1/probe
```

### Performance Monitoring

**For Railway:**
- Dashboard → Metrics tab
- Monitor CPU, Memory, Network usage

**For Render:**
- Service dashboard → Logs & Metrics
- View real-time metrics

**For Fly.io:**
```bash
flyctl metrics
```

**For systemd:**
```bash
# Monitor resource usage
top -p $(pgrep -f "node server.js")

# Check disk usage
df -h

# Check memory
free -h
```

### Log Monitoring

**Railway/Render/Fly.io:**
- View logs in dashboard

**systemd:**
```bash
sudo journalctl -u iptv-streaming-server -f
```

**PM2:**
```bash
pm2 logs iptv-streaming-server
```

### Regular Maintenance

1. **Update dependencies monthly:**
```bash
npm update
npm audit
```

2. **Monitor disk space:**
```bash
df -h
```

3. **Check memory usage:**
```bash
free -h
ps aux | grep node
```

4. **Restart service periodically:**
```bash
# systemd
sudo systemctl restart iptv-streaming-server

# PM2
pm2 restart iptv-streaming-server
```

---

## Troubleshooting

### Server won't start

**Check logs:**
```bash
# Railway/Render/Fly.io: View in dashboard
# systemd: sudo journalctl -u iptv-streaming-server
# PM2: pm2 logs iptv-streaming-server
```

**Common issues:**
- Port already in use: `lsof -i :3000`
- FFmpeg not installed: `which ffmpeg`
- Missing environment variables: Check `.env` file

### No stream output

**Verify channel sources:**
```bash
# Test RTSP connection
ffmpeg -rtsp_transport tcp -i rtsp://your-source.com/stream -t 5 -f null -
```

**Check FFmpeg logs:**
```bash
# Enable verbose logging in server.js
# Restart and check logs
```

### High memory usage

**Check processes:**
```bash
ps aux | grep node
```

**Restart service:**
```bash
# systemd
sudo systemctl restart iptv-streaming-server

# PM2
pm2 restart iptv-streaming-server
```

### Connection timeouts

**Increase timeout values in server.js:**
```javascript
'-timeout', '30000000', // 30 seconds
'-reconnect', '1',
'-reconnect_at_eof', '1'
```

### CORS errors

**Server already has CORS enabled**, but if issues persist:
- Check browser console for specific errors
- Verify server URL in watch.html
- Test with: `curl -H "Origin: *" https://your-server.com/health`

---

## Performance Optimization

### For 500+ Concurrent Viewers

1. **Increase system limits:**
```bash
# Edit /etc/security/limits.conf
* soft nofile 65535
* hard nofile 65535
```

2. **Tune kernel parameters:**
```bash
sudo sysctl -w net.core.somaxconn=65535
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=65535
```

3. **Use load balancing:**
- Deploy multiple instances behind a load balancer
- Use Railway/Render auto-scaling features

4. **Optimize FFmpeg settings:**
- Use hardware acceleration if available
- Adjust buffer sizes based on network conditions

---

## Scaling Strategy

### Horizontal Scaling (Multiple Instances)

**Railway/Render/Fly.io:**
- Automatic scaling available
- Configure in platform settings

**Manual scaling with load balancer:**
- Deploy multiple instances
- Use nginx/HAProxy for load balancing
- Share channel sources across instances

### Vertical Scaling (Larger Instance)

- Increase CPU/Memory allocation
- Use platform settings to upgrade instance type

---

## Security Checklist

- [ ] Use HTTPS/SSL in production
- [ ] Set strong environment variables
- [ ] Enable firewall rules
- [ ] Monitor logs regularly
- [ ] Keep dependencies updated
- [ ] Use non-root user for systemd service
- [ ] Restrict API access if needed
- [ ] Enable rate limiting (optional)

---

## Support & Resources

- **Documentation:** See README.md
- **Issues:** Check GitHub issues
- **Community:** Join community forums

---

**Last Updated:** 2026-06-13  
**Version:** 1.0.0  
**Status:** Production Ready ✅
