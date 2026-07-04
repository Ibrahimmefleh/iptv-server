# IPTV Streaming Server - Production Ready

**Professional-grade IPTV streaming server** supporting MPEG-TS and HLS with 24/7 continuous operation, 500+ concurrent viewers, and automatic reconnection.

## 🚀 Features

- ✅ **MPEG-TS Live Streaming** - Low-latency, high-quality streaming
- ✅ **HLS Support** - HTTP Live Streaming for broader compatibility
- ✅ **500+ Concurrent Viewers** - Handles massive viewer loads
- ✅ **24/7 Continuous Operation** - Designed for production use
- ✅ **Automatic Reconnection** - Self-healing stream management
- ✅ **Buffer Optimization** - Smart buffering for smooth playback
- ✅ **Very Low Latency Mode** - Real-time streaming capabilities
- ✅ **Multi-Platform Deployment** - Railway, Render, Fly.io, Docker, systemd
- ✅ **Health Monitoring** - Built-in health checks and status endpoints
- ✅ **Graceful Shutdown** - Clean process termination

## 📋 API Endpoints

### Stream Statistics
```
GET /api/stream/stats
```
Returns channel statistics including viewer count and active status.

**Response:**
```json
[
  {
    "id": "channel1",
    "name": "الحسن الرياضية 1",
    "active": true,
    "viewers": 150,
    "uptime": 3600,
    "bytesStreamed": 1234567890,
    "lastError": null
  }
]
```

### MPEG-TS Stream
```
GET /api/stream/{channelId}
```
Streams MPEG-TS data for the specified channel.

**Parameters:**
- `channelId` - Channel identifier (channel1, channel2, etc.)

**Headers:**
- `Content-Type: video/mp2t`
- `Transfer-Encoding: chunked`

### Stream Probe
```
GET /api/stream/{channelId}/probe
```
Returns stream type information and capabilities.

**Response:**
```json
{
  "id": "channel1",
  "name": "الحسن الرياضية 1",
  "type": "ts",
  "active": true,
  "formats": ["ts", "hls"],
  "bitrate": "auto",
  "resolution": "1920x1080",
  "fps": 30
}
```

### Health Check
```
GET /health
```
Returns server health status and uptime information.

## 🛠️ Installation

### Prerequisites
- Node.js 16+ or Docker
- FFmpeg (for local deployment)
- npm or yarn

### Local Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-repo/iptv-streaming-server.git
cd iptv-streaming-server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your channel sources
```

4. **Start the server:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t iptv-streaming-server:latest .
```

### Run Docker Container
```bash
docker run -d \
  --name iptv-server \
  -p 3000:3000 \
  -e CHANNEL1_SOURCE="rtsp://example.com/stream1" \
  -e CHANNEL2_SOURCE="rtsp://example.com/stream2" \
  -e NODE_ENV=production \
  iptv-streaming-server:latest
```

### Docker Compose
```yaml
version: '3.8'

services:
  iptv-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      CHANNEL1_SOURCE: rtsp://example.com/stream1
      CHANNEL2_SOURCE: rtsp://example.com/stream2
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## ☁️ Cloud Deployment

### Railway

1. **Connect your repository to Railway**
2. **Set environment variables:**
   - `CHANNEL1_SOURCE`
   - `CHANNEL2_SOURCE`
3. **Deploy** - Railway will automatically detect the Dockerfile

### Render

1. **Create new Web Service**
2. **Select Docker as runtime**
3. **Configure environment variables**
4. **Deploy** - Render will use render.yaml configuration

### Fly.io

1. **Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Authenticate:**
```bash
flyctl auth login
```

3. **Deploy:**
```bash
flyctl launch
flyctl deploy
```

## 🔧 PM2 Process Management

### Install PM2
```bash
npm install -g pm2
```

### Start with PM2
```bash
pm2 start ecosystem.config.js
```

### Save PM2 Configuration
```bash
pm2 save
```

### Enable Auto-startup
```bash
pm2 startup
```

### Monitor Processes
```bash
pm2 monit
pm2 logs
```

## 🐧 systemd Service (Linux)

### Installation

1. **Copy service file:**
```bash
sudo cp iptv-streaming-server.service /etc/systemd/system/
```

2. **Create application directory:**
```bash
sudo mkdir -p /opt/iptv-streaming-server
sudo cp -r . /opt/iptv-streaming-server/
sudo chown -R www-data:www-data /opt/iptv-streaming-server
```

3. **Install dependencies:**
```bash
cd /opt/iptv-streaming-server
sudo npm install --production
```

4. **Enable and start service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable iptv-streaming-server
sudo systemctl start iptv-streaming-server
```

### Service Management

```bash
# Check status
sudo systemctl status iptv-streaming-server

# View logs
sudo journalctl -u iptv-streaming-server -f

# Restart
sudo systemctl restart iptv-streaming-server

# Stop
sudo systemctl stop iptv-streaming-server
```

## 📊 Monitoring

### Check Server Status
```bash
curl http://localhost:3000/health
```

### Monitor Stream Statistics
```bash
curl http://localhost:3000/api/stream/stats
```

### View PM2 Logs
```bash
pm2 logs iptv-streaming-server
```

### View systemd Logs
```bash
sudo journalctl -u iptv-streaming-server -f
```

## 🔒 Security Considerations

1. **Use HTTPS in production** - Deploy behind a reverse proxy (nginx, Caddy)
2. **Restrict access** - Use firewall rules or authentication
3. **Monitor resources** - Set memory and CPU limits
4. **Keep updated** - Regularly update Node.js and dependencies
5. **Use environment variables** - Never hardcode sensitive data

## 📈 Performance Optimization

### Memory Management
- Automatic garbage collection
- Configurable buffer sizes
- Process memory limits

### CPU Optimization
- Copy codec (no re-encoding)
- Efficient MPEG-TS muxing
- Connection pooling

### Network Optimization
- Chunked transfer encoding
- Connection keep-alive
- Automatic reconnection

## 🐛 Troubleshooting

### Server won't start
```bash
# Check port availability
lsof -i :3000

# Check FFmpeg installation
which ffmpeg
ffmpeg -version
```

### No stream output
```bash
# Verify channel sources
echo $CHANNEL1_SOURCE
echo $CHANNEL2_SOURCE

# Check FFmpeg logs
pm2 logs iptv-streaming-server
```

### High memory usage
```bash
# Check memory limits
pm2 show iptv-streaming-server

# Restart server
pm2 restart iptv-streaming-server
```

### Connection timeouts
```bash
# Increase timeout values in .env
# Check network connectivity
ping example.com
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | production | Environment mode |
| `PORT` | 3000 | Server port |
| `HOST` | 0.0.0.0 | Server host |
| `CHANNEL1_SOURCE` | - | RTSP/HTTP source for channel 1 |
| `CHANNEL2_SOURCE` | - | RTSP/HTTP source for channel 2 |
| `FFMPEG_PATH` | ffmpeg | FFmpeg binary path |
| `FFPROBE_PATH` | ffprobe | FFprobe binary path |

## 🔄 Automatic Restart

### PM2 Cron Restart
Server automatically restarts daily at 2 AM (configured in ecosystem.config.js)

### systemd Auto-restart
Service automatically restarts on failure with 10-second delay

## 📞 Support & Contribution

For issues, questions, or contributions, please visit the repository.

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated:** 2026-06-13  
**Version:** 1.0.0  
**Status:** Production Ready ✅
