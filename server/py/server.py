from flask import Flask, request
from flask_socketio import SocketIO, emit
import uuid

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

clients = {}  # Stores client_id -> session_id mapping

@app.route("/")
def index():
    return "Socket.IO server running!"

@app.route("/health")
def health():
    return {"status": "healthy"}

@socketio.on("register_id")
def handle_register(data):
    """ Allows clients to connect with their own ID or assigns a random one """
    requested_id = data.get("client_id", "").strip()
    print(requested_id)

    # If no ID is provided or it's taken, generate a new one
    if not requested_id or requested_id in clients:
        new_id = str(uuid.uuid4())[:14]
        while new_id in clients:  # Ensure uniqueness
            new_id = str(uuid.uuid4())[:14]
        client_id = new_id
    else:
        client_id = requested_id

    clients[client_id] = request.sid
    print(f"Client {client_id} connected with session ID {request.sid}")

    emit("registration_success", {"client_id": client_id})

@socketio.on("disconnect")
def handle_disconnect():
    """ Remove the disconnected client """
    for client_id, sid in list(clients.items()):
        if sid == request.sid:
            print(f"Client {client_id} disconnected.")
            del clients[client_id]
            break

@socketio.on("send_message")
def handle_send_message(data):
    """ Send a message to a specific client ID """
    target_id = data.get("target_id")
    message = data.get("message")
    sender_id = data.get("from")

    if target_id in clients:
        socketio.emit("receive_message", {"from": sender_id, "message": message}, room=clients[target_id])
    else:
        emit("error", {"message": "Target ID not found"}, room=clients[sender_id])

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
