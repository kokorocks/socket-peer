from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import uuid

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

clients = {}  # Stores client_id -> session_id mapping

@app.route("/")
def index():
    return "Socket.IO server running!"

@socketio.on("connect")
def handle_connect():
    client_id = str(uuid.uuid4())  # Generate a unique client ID
    clients[client_id] = request.sid
    emit("assigned_id", {"client_id": client_id})  # Send ID to client

@socketio.on("disconnect")
def handle_disconnect():
    for client_id, sid in list(clients.items()):
        if sid == request.sid:
            del clients[client_id]
            break

@socketio.on("send_message")
def handle_send_message(data):
    """ Send message to a specific client by ID """
    target_id = data.get("target_id")
    message = data.get("message")

    if target_id in clients:
        socketio.emit("receive_message", {"from": data.get("from"), "message": message}, room=clients[target_id])

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
