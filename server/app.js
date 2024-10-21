import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();

// Middleware
// app.use(cors()); // Enable CORS
app.use(cors({
  origin: 'https://nalo-send-sms-server.onrender.com', // Allow requests from your React app
  credentials: true
})); 

app.use(express.json()); // Middleware to parse JSON bodies

// POST request route
app.post('/', (req, res) => {

  const requestData = req.body;
  console.log(req.body)
  broadcastToClients(requestData);

  res.send('Hello World'); // Respond with 'Hello World'
});

// Start the server
const server = app.listen(5000, () => {
  console.log('App is running on port 5000');
});



// WebSocket Server
const wss = new WebSocketServer({ server });

function broadcastToClients(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  // ws.send(JSON.stringify({ message: 'WebSocket connected' }));
});