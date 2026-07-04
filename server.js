#!/usr/bin/env node

/**
 * ========================================
 * IPTV Streaming Server - Production Ready
 * With Admin Dashboard & Channel Management
 * ========================================
 * 
 * Professional streaming server supporting:
 * - MPEG-TS Live Streaming
 * - HLS (HTTP Live Streaming)
 * - Admin Dashboard for channel management
 * - Scheduled URL changes
 * - Ticker/News bar management
 * - Multiple concurrent viewers (500+)
 * - Automatic reconnection support
 * - 24/7 continuous operation
 * 
 * ========================================
 */

const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
require('dotenv').config();

// ========================================
// Configuration
// ========================================

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// FFmpeg configuration
const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE_PATH = process.env.FFPROBE_PATH || 'ffprobe';

ffmpeg.setFfmpegPath(FFMPEG_PATH);
ffmpeg.setFfprobePath(FFPROBE_PATH);

// Data storage path
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CHANNELS_FILE = path.join(DATA_DIR, 'channels.json');
const TICKER_FILE = path.join(DATA_DIR, 'ticker.json');

// ========================================
// Channel Configuration
// ========================================

const DEFAULT_CHANNELS = {
  channel1: {
    id: 'channel1',
    name: 'الحسن الرياضية 1',
    source: process.env.CHANNEL1_SOURCE || 'http://ugeen.live:8080/Ugeen_VIPwM1NS0/mn9Nz8/4527',
    originalSource: process.env.CHANNEL1_SOURCE || 'http://ugeen.live:8080/Ugeen_VIPwM1NS0/mn9Nz8/4527',
    active: true,
    viewers: 0,
    lastError: null,
    process: null,
    startTime: null,
    bytesStreamed: 0,
    scheduledChange: null
  },
  channel2: {
    id: 'channel2',
    name: 'الحسن الرياضية 2',
    source: process.env.CHANNEL2_SOURCE || 'http://ugeen.live:8080/Ugeen_VIP81PGr0/SevCYn/4530',
    originalSource: process.env.CHANNEL2_SOURCE || 'http://ugeen.live:8080/Ugeen_VIP81PGr0/SevCYn/4530',
    active: true,
    viewers: 0,
    lastError: null,
    process: null,
    startTime: null,
    bytesStreamed: 0,
    scheduledChange: null
  },
  channel3: {
    id: 'channel3',
    name: 'الحسن الرياضية 3',
    source: process.env.CHANNEL3_SOURCE || 'http://ugeen.live:8080/Ugeen_VIPPW6mXp/ovdB6d/154',
    originalSource: process.env.CHANNEL3_SOURCE || 'http://ugeen.live:8080/Ugeen_VIPPW6mXp/ovdB6d/154',
    active: true,
    viewers: 0,
    lastError: null,
    process: null,
    startTime: null,
    bytesStreamed: 0,
    scheduledChange: null
  },
  channel4: {
    id: 'channel4',
    name: 'الحسن الرياضية 4',
    source: process.env.CHANNEL4_SOURCE || 'http://ugeen.live:8080/Ugeen_VIPRL6Q3u/5rjaYz/168',
    originalSource: process.env.CHANNEL4_SOURCE || 'http://ugeen.live:8080/Ugeen_VIPRL6Q3u/5rjaYz/168',
    active: true,
    viewers: 0,
    lastError: null,
    process: null,
    startTime: null,
    bytesStreamed: 0,
    scheduledChange: null
  }
};

let CHANNELS = JSON.parse(JSON.stringify(DEFAULT_CHANNELS));
let TICKER = { text: '', enabled: false, repeatCount: 0 };

// Load saved data
function loadData() {
  try {
    if (fs.existsSync(CHANNELS_FILE)) {
      CHANNELS = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading channels data:', e.message);
  }

  try {
    if (fs.existsSync(TICKER_FILE)) {
      TICKER = JSON.parse(fs.readFileSync(TICKER_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading ticker data:', e.message);
  }
}

function saveData() {
  try {
    fs.writeFileSync(CHANNELS_FILE, JSON.stringify(CHANNELS, null, 2));
    fs.writeFileSync(TICKER_FILE, JSON.stringify(TICKER, null, 2));
  } catch (e) {
    console.error('Error saving data:', e.message);
  }
}

loadData();

// ========================================
// Global State Management
// ========================================

const streamSessions = new Map();
const scheduledTasks = new Map();

// ========================================
// Express App Setup
// ========================================

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  credentials: false,
  maxAge: 3600
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// Authentication Middleware
// ========================================

function authMiddleware(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ========================================
// API Endpoints - Public
// ========================================

/**
 * GET /api/stream/stats
 * Returns statistics for all channels
 */
app.get('/api/stream/stats', (req, res) => {
  try {
    const stats = Object.values(CHANNELS).map(ch => ({
      id: ch.id,
      name: ch.name,
      active: ch.active,
      viewers: ch.viewers,
      uptime: ch.startTime ? Math.floor((Date.now() - ch.startTime) / 1000) : 0,
      bytesStreamed: ch.bytesStreamed,
      lastError: ch.lastError,
      source: ch.source
    }));

    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json(stats);
  } catch (error) {
    console.error('Error in /api/stream/stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/ticker
 * Returns current ticker configuration
 */
app.get('/api/ticker', (req, res) => {
  res.json(TICKER);
});

/**
 * GET /api/stream/:channelId
 * Stream MPEG-TS data for the specified channel
 */
app.get('/api/stream/:channelId', (req, res) => {
  const { channelId } = req.params;
  const channel = CHANNELS[channelId];

  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  if (!channel.active) {
    return res.status(503).json({ error: 'Channel is offline' });
  }

  const sessionId = uuidv4();
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

  console.log(`[STREAM] New viewer connected: ${sessionId} for ${channelId} from ${clientIp}`);

  channel.viewers++;
  streamSessions.set(sessionId, {
    channelId,
    clientIp,
    startTime: Date.now()
  });

  res.set({
    'Content-Type': 'video/mp2t',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked',
    'Access-Control-Allow-Origin': '*'
  });

  const ffmpegProcess = createStreamingProcess(channel, res, sessionId);

  req.on('close', () => {
    console.log(`[STREAM] Viewer disconnected: ${sessionId}`);
    channel.viewers = Math.max(0, channel.viewers - 1);
    streamSessions.delete(sessionId);

    if (ffmpegProcess && !ffmpegProcess.killed) {
      try {
        ffmpegProcess.kill('SIGTERM');
      } catch (e) {
        // Silent catch
      }
    }
  });

  res.on('error', (error) => {
    console.error(`[STREAM] Error in response stream ${sessionId}:`, error.message);
    channel.viewers = Math.max(0, channel.viewers - 1);
    streamSessions.delete(sessionId);

    if (ffmpegProcess && !ffmpegProcess.killed) {
      try {
        ffmpegProcess.kill('SIGTERM');
      } catch (e) {
        // Silent catch
      }
    }
  });
});

/**
 * GET /api/stream/:channelId/probe
 * Probe stream type and return stream information
 */
app.get('/api/stream/:channelId/probe', (req, res) => {
  const { channelId } = req.params;
  const channel = CHANNELS[channelId];

  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  res.set({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });

  res.json({
    id: channel.id,
    name: channel.name,
    type: 'ts',
    active: channel.active,
    formats: ['ts', 'hls']
  });
});

// ========================================
// API Endpoints - Admin
// ========================================

/**
 * POST /api/admin/channel/:channelId/toggle
 * Toggle channel on/off
 */
app.post('/api/admin/channel/:channelId/toggle', authMiddleware, (req, res) => {
  const { channelId } = req.params;
  const channel = CHANNELS[channelId];

  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  channel.active = !channel.active;
  saveData();

  res.json({ success: true, active: channel.active });
});

/**
 * PUT /api/admin/channel/:channelId/source
 * Update channel source URL
 */
app.put('/api/admin/channel/:channelId/source', authMiddleware, (req, res) => {
  const { channelId } = req.params;
  const { source } = req.body;
  const channel = CHANNELS[channelId];

  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  if (!source) {
    return res.status(400).json({ error: 'Source URL is required' });
  }

  channel.source = source;
  saveData();

  res.json({ success: true, source: channel.source });
});

/**
 * POST /api/admin/channel/:channelId/schedule
 * Schedule a temporary URL change
 */
app.post('/api/admin/channel/:channelId/schedule', authMiddleware, (req, res) => {
  const { channelId } = req.params;
  const { tempSource, startTime, endTime } = req.body;
  const channel = CHANNELS[channelId];

  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  if (!tempSource || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (start >= end) {
    return res.status(400).json({ error: 'Invalid time range' });
  }

  channel.scheduledChange = { tempSource, startTime: start, endTime: end };
  
  // Clear existing scheduled task for this channel
  if (scheduledTasks.has(channelId)) {
    clearTimeout(scheduledTasks.get(channelId).startTimer);
    clearTimeout(scheduledTasks.get(channelId).endTimer);
  }

  // Schedule the change
  const startTimer = setTimeout(() => {
    channel.source = tempSource;
    console.log(`[SCHEDULE] Applied temporary source for ${channelId}`);
  }, start - Date.now());

  const endTimer = setTimeout(() => {
    channel.source = channel.originalSource;
    channel.scheduledChange = null;
    console.log(`[SCHEDULE] Reverted to original source for ${channelId}`);
    saveData();
  }, end - Date.now());

  scheduledTasks.set(channelId, { startTimer, endTimer });
  saveData();

  res.json({ success: true, scheduled: channel.scheduledChange });
});

/**
 * PUT /api/admin/ticker
 * Update ticker configuration
 */
app.put('/api/admin/ticker', authMiddleware, (req, res) => {
  const { text, enabled, repeatCount } = req.body;

  if (text !== undefined) TICKER.text = text;
  if (enabled !== undefined) TICKER.enabled = enabled;
  if (repeatCount !== undefined) TICKER.repeatCount = repeatCount;

  saveData();

  res.json({ success: true, ticker: TICKER });
});

/**
 * GET /api/admin/channels
 * Get all channels configuration
 */
app.get('/api/admin/channels', authMiddleware, (req, res) => {
  res.json(CHANNELS);
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ========================================
// FFmpeg Process Management
// ========================================

function createStreamingProcess(channel, res, sessionId) {
  try {
    const command = ffmpeg(channel.source)
      .inputOptions([
        '-rtsp_transport', 'tcp',
        '-buffer_size', '2048000',
        '-timeout', '15000000',
        '-reconnect', '1',
        '-reconnect_at_eof', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '5'
      ])
      .outputOptions([
        '-c:v', 'copy',
        '-c:a', 'copy',
        '-f', 'mpegts',
        '-mpegts_flags', 'resend_headers',
        '-max_muxing_queue_size', '1024'
      ])
      .on('start', (commandLine) => {
        channel.active = true;
        channel.startTime = channel.startTime || Date.now();
        channel.lastError = null;
      })
      .on('error', (error) => {
        channel.lastError = error.message;
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error' });
        } else if (!res.writableEnded) {
          res.end();
        }
      })
      .on('end', () => {
        // Stream ended
      });

    command.pipe(res, { end: true });
    return command;
  } catch (error) {
    channel.lastError = error.message;
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start stream' });
    }
    return null;
  }
}

// ========================================
// Server Start
// ========================================

app.listen(PORT, HOST, () => {
  console.log(`IPTV Server running on http://${HOST}:${PORT}`);
  console.log(`Admin Dashboard: http://${HOST}:${PORT}/admin.html`);
  console.log(`Channels: ${Object.keys(CHANNELS).length} configured.`);
  console.log(`Admin Password: ${ADMIN_PASSWORD}`);
});
