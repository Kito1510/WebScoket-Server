// server.js
const express = require('express');
const { WebSocketServer } = require('ws');
const app = express();
const port = process.env.PORT || 3000;

// Express serverの設定
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// WebSocket serverの設定
const wss = new WebSocketServer({ server });

// 接続しているクライアントを保持
const clients = new Set();

// WebSocket接続の処理
wss.on('connection', (ws) => {
    // 新しいクライアントを追加
    clients.add(ws);
    console.log('New client connected');

    // クライアントからのメッセージを処理
    ws.on('message', (data) => {
        try {
            // 全クライアントにメッセージをブロードキャスト
            const message = JSON.parse(data);
            const broadcastMessage = JSON.stringify({
                id: message.id,
                username: message.username,
                text: message.text,
                timestamp: message.timestamp
            });

            clients.forEach((client) => {
                if (client.readyState === ws.OPEN) {
                    client.send(broadcastMessage);
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    // 接続が閉じられたときの処理
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

// Basic health check endpoint
app.get('/', (req, res) => {
    res.send('WebSocket Server is running');
});
