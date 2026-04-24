const express = require('express');
const { spawn } = require('child_process');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

let mcProcess = null;

app.get('/', (req, res) => { res.render('index'); });

io.on('connection', (socket) => {
    socket.on('start-server', () => {
        if (mcProcess) return socket.emit('output', '\x1b[31mServer already running!\x1b[0m\r\n');

        // Minecraft Launch Command
        mcProcess = spawn('java', ['-Xmx1G', '-jar', 'server.jar', 'nogui']);

        mcProcess.stdout.on('data', (data) => { io.emit('output', data.toString().replace(/\n/g, '\r\n')); });
        mcProcess.stderr.on('data', (data) => { io.emit('output', data.toString().replace(/\n/g, '\r\n')); });

        mcProcess.on('exit', () => {
            io.emit('output', '\r\n\x1b[31mServer Stopped.\x1b[0m\r\n');
            mcProcess = null;
        });
    });

    socket.on('command', (cmd) => {
        if (mcProcess) mcProcess.stdin.write(cmd + '\n');
    });
});

server.listen(3000, () => console.log('Panel Live!'));
