const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
require("dotenv").config({ path: "./config.env" });

const PORT = process.env.PORT;

const io = new Server(server, {
    cors: {
        origin: [`http://localhost:${PORT}`],
    },
});

const userSocketMap = {};

function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}



io.on("connection", (socket) => {
    console.log("A user connected ", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user disconnected ", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

});

module.exports = { io, app, server, getReceiverSocketId };