import socketio

class PeerClient:
    def __init__(self, server_url, client_id=None):
        self.sio = socketio.Client()
        self.client_id = client_id

        @self.sio.on("assigned_id")
        def on_assigned_id(data):
            self.client_id = data["client_id"]
            print(f"Assigned ID: {self.client_id}")

        @self.sio.on("receive_message")
        def on_receive_message(data):
            print(f"Message from {data['from']}: {data['message']}")

        @self.sio.on("error")
        def on_error(data):
            print(f"Error: {data['message']}")

        self.sio.connect(server_url)
        self.sio.emit("register", {"client_id": self.client_id})

    def send_message(self, target_id, message):
        if not self.client_id:
            print("You are not registered with the server.")
            return
        self.sio.emit("send_message", {"from": self.client_id, "target_id": target_id, "message": message})

    def close(self):
        self.sio.disconnect()

# Example usage
if __name__ == "__main__":
    client = PeerClient("https://upgraded-barnacle-7v4xprj74jwhxr55-5000.app.github.dev/", client_id="user123")
    
    while True:
        target = input("Enter recipient ID: ")
        msg = input("Enter message: ")
        client.send_message(target, msg)
