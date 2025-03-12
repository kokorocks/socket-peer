const socket = io("https://upgraded-barnacle-7v4xprj74jwhxr55-5000.app.github.dev/");

let clientId = null;

function registerClient(customId = null) {
    socket.emit("register", { client_id: customId });
}

socket.on("assigned_id", (data) => {
    clientId = data.client_id;
    console.log("Assigned ID:", clientId);
});

socket.on("receive_message", (data) => {
    console.log(`Message from ${data.from}: ${data.message}`);
});

socket.on("error", (data) => {
    console.log("Error:", data.message);
});

function sendMessage(targetId, message) {
    if (!clientId) {
        console.log("You are not registered.");
        return;
    }
    socket.emit("send_message", { from: clientId, target_id: targetId, message: message });
}

// Example usage:
// registerClient("user123");
// sendMessage("user456", "Hello, user456!");
