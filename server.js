const express = require('express');
const fs = require('fs');
const path = require('path');
const promClient = require('prom-client');

const app = express();

const PORT = process.env.PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'development';
const APP_NAME = process.env.APP_NAME || 'K3s Mission Control';
const VERSION = process.env.VERSION || 'v1';
const API_KEY = process.env.API_KEY || '';

const LOG_DIR = process.env.LOG_DIR || '/app/data';
const LOG_FILE = path.join(LOG_DIR, 'visits.log');

// ── Prometheus metrics setup ──────────────────────────────
const register = promClient.register;

// Collect default Node.js metrics automatically:
// CPU, memory, event loop lag, garbage collection, etc.
promClient.collectDefaultMetrics({
  register,
  prefix: 'mission_control_'
});

// Custom counter — increments every time the main page is visited
const pageVisitsCounter = new promClient.Counter({
  name: 'mission_control_page_visits_total',
  help: 'Total number of times the main page was visited'
});

// Custom gauge — tracks how many visit log entries have been written
const visitLogSize = new promClient.Gauge({
  name: 'mission_control_visit_log_lines',
  help: 'Number of lines in the visit log file'
});

// Custom histogram — tracks response time of the main page
const responseTime = new promClient.Histogram({
  name: 'mission_control_response_time_seconds',
  help: 'Response time of the main page in seconds',
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2]
});

// ── Helper function ───────────────────────────────────────
function logVisit() {
  const entry = `${new Date().toISOString()} - page visited`;

  // This appears in Loki because Promtail reads container stdout
  console.log(entry);

  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, entry + '\n');

    const content = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(Boolean).length;

    visitLogSize.set(lines);
  } catch (e) {
    console.error('Could not write to visit log:', e.message);
    visitLogSize.set(0);
  }
}

// ── Routes ────────────────────────────────────────────────
app.get('/', (req, res) => {
  const end = responseTime.startTimer();

  pageVisitsCounter.inc();
  logVisit();

  res.on('finish', () => {
    end();
  });

  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: APP_NAME,
    env: APP_ENV,
    version: VERSION,
    api_key: API_KEY ? 'set' : 'not set',
    time: new Date().toISOString()
  });
});

// Expose safe config to the frontend
app.get('/config', (req, res) => {
  res.json({
    appName: APP_NAME,
    env: APP_ENV,
    version: VERSION
  });
});

// Prometheus scrapes this endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`${APP_NAME} running on port ${PORT} [${APP_ENV}]`);
});