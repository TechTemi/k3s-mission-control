const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/health', (req, res) => res.json({ status: 'ok', time: new
Date().toISOString() }));
app.use(express.static(__dirname + '/public'));
app.listen(PORT, () => console.log(`Running on port ${PORT}`));