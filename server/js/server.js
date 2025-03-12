const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const clients = {}; // Stores client_id -> socket_id mapping

app.get("/", (req, res) => {
    res.send("Socket.IO server running!");
});

io.on("connection", (socket) => {
    const client_id = uuidv4(); // Generate a unique client ID
    clients[client_id] = socket.id;
    socket.emit("assigned_id", { client_id });

    socket.on("disconnect", () => {
        for (const [id, sid] of Object.entries(clients)) {
            if (sid === socket.id) {
                delete clients[id];
                break;
            }
        }
    });

    socket.on("send_message", (data) => {
        const target_id = data.target_id;
        const message = data.message;
        if (clients[target_id]) {
            io.to(clients[target_id]).emit("receive_message", {
                from: data.from,
                message: message,
            });
        }
    });
});

server.listen(5000, () => {
    console.log("Socket.IO server running on port 5000");
});