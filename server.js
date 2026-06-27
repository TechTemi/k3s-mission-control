const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Read config from environment variables injected by ConfigMap/Secret
const PORT = process.env.PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'development';
const APP_NAME = process.env.APP_NAME || 'K3s Mission Control';
const VERSION = process.env.VERSION || 'v1';
const API_KEY = process.env.API_KEY || '';

const LOG_FILE = path.join('/app/data', 'visits.log');

// Visit logger — writes to the mounted persistent volume
function logVisit() {
const entry = `${new Date().toISOString()} - page visited\n`;

try {
fs.appendFileSync(LOG_FILE, entry);
} catch (e) {
console.error('Could not write to log:', e.message);
}
}

app.get('/', (req, res) => {
logVisit();
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

// Expose config to the frontend via a /config endpoint
app.get('/config', (req, res) => {
res.json({
appName: APP_NAME,
env: APP_ENV,
version: VERSION
});
});

// Show visit logs from the mounted persistent volume
app.get('/logs', (req, res) => {
try {
const content = fs.readFileSync(LOG_FILE, 'utf8');
res.type('text/plain').send(content || 'No visits yet.');
} catch (e) {
res.type('text/plain').send('Log file not found. Try visiting / first.');
}
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
console.log(`${APP_NAME} running on port ${PORT} [${APP_ENV}]`);
});