const ws = new WebSocket("wss://k.hotaru.icu/adapter/sandbox")

ws.onopen = () => {
  console.log("Connected to server")
  ws.send(JSON.stringify({
    event: "on_message",
    type: 0,
    message: "/help",
    messageAlt: "/help",
    userId: "1234567890",
    sender: {
      nickname: "Alice"
    },
    time: Date.now()
  }))
  console.log("Message sent /help")
}

ws.onmessage = (event) => console.log("Received action:", JSON.parse(event.data))