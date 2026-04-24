const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

// Terminal setup - Bash open karega
const shell = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.cwd(),
    env: process.env
});

shell.onData((data) => {
    io.emit('terminal-output', data);
});

io.on('connection', (socket) => {
    console.log('User connected to Panel');
    socket.on('terminal-input', (data) => {
        shell.write(data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Dhoom Panel is live on port ${PORT}`);
});
