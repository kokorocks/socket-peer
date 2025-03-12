import io from "socket.io-client";

io()

class SimpleSocketClient {
    servers = [
        'https://upgraded-barnacle-7v4xprj74jwhxr55-5000.app.github.dev/',
        'https://another-server-url.com/',
        'https://yet-another-server-url.com/'
    ];

    constructor(serverUrl) {
        this.clientId = ""; // Start without a stored ID
        this.connectToServer(serverUrl || this.servers);
    }

    connectToServer(servers) {
        if (typeof servers === 'string') {
            servers = [servers];
        }

        const tryNextServer = (index) => {
            if (index >= servers.length) {
                console.error("All servers are unreachable.");
                return;
            }

            const url = servers[index];
            console.log(`Attempting to connect to ${url}`);
            const socket = io(url, { timeout: 5000 });

            socket.on('connect', () => {
                console.log(`Connected to ${url}`);
                this.socket = socket;
                this.setupSocketListeners();
            });

            socket.on('connect_error', () => {
                console.warn(`Failed to connect to ${url}, trying next server...`);
                tryNextServer(index + 1);
            });
        };

        tryNextServer(0);
    }

    setupSocketListeners() {
        this.socket.on("registration_success", (data) => {
            this.clientId = data.client_id;
            this.onRegistrationSuccess(this.clientId);
        });

        this.socket.on("receive_message", (data) => {
            this.onReceiveMessage(data.from, data.message);
        });
    }

    registerId(userInput) {
        this.socket.emit("register_id", { client_id: userInput });
    }

    sendMessage(targetId, message) {
        if (!targetId || !message) {
            this.onMessageError("Enter target ID and message!");
            return;
        }

        this.socket.emit("send_message", {
            from: this.clientId,
            target_id: targetId,
            message: message,
        });
        this.onSendMessage(this.clientId, message);
    }

    // Event Handlers (You'll need to set these up!)
    onRegistrationSuccess(clientId) {
        console.log("Registration successful! Client ID:", clientId);
        // Add your code here for what happens when registration is successful.
    }

    onReceiveMessage(from, message) {
        console.log("Received message:", from, message);
        // Add your code here for what happens when a message is received.
    }

    onSendMessage(from, message) {
        console.log("Sent message:", from, message);
    }

    onMessageError(errorMessage) {
        console.error("Message error:", errorMessage);
        // Add your code here for what happens when there's an error sending a message.
    }
}