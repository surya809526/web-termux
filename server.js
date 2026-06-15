const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { exec } = require('child_process');
const path = require('path');

// Serve frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('👤 User connected to Cloud Terminal');

    // Intercept command from mobile browser
    socket.on('command', (cmd) => {
        if (!cmd) return;

        // Security check: 'cd' command process wrapper logic
        if (cmd.startsWith('cd ')) {
            socket.emit('output', '⚠️ Note: Directory change restricted in basic shell execution.\n$ ');
            return;
        }

        // Execute command inside Render's Linux Kernel
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                socket.emit('output', `❌ Error: ${error.message}\n$ `);
                return;
            }
            if (stderr) {
                socket.emit('output', `⚠️ Stderr: ${stderr}\n$ `);
                return;
            }
            // Send back raw console outputs to mobile device screen
            socket.emit('output', `${stdout}\n$ `);
        });
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`🚀 Web-Termux Server Live on Port ${PORT}`);
});
