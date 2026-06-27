const express = require ('express');
const app = express();
// Read config from environment variables (injected by ConfigMap)
const PORT = process.env.PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'development';
const APP_NAME = process.env.APP_NAME || 'K3s Mission Control';
const VERSION = process.env.VERSION || 'v1';
const API_KEY = process.env.API_KEY || 'not-set';
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/health', (req, res) => {
res.json({
status: 'ok',
app: APP_NAME,
env: APP_ENV,
version: VERSION,
api_key: API_KEY ? 'set' : 'not set', // never expose the real value
time: new Date().toISOString()
});
});
// Expose config to the frontend via a /config endpoint
app.get('/config', (req, res) => {
res.json({ appName: APP_NAME, env: APP_ENV, version: VERSION });
});
app.use(express.static(__dirname + '/public'));
app.listen(PORT, () => console.log(`${APP_NAME} running on port ${PORT}
[${APP_ENV}]`));