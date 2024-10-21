import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware to parse JSON bodies

// POST request route
app.get('/', (req, res) => {
    console.log("someserver" + req.body)
  res.send('Hello World'); // Respond with 'Hello World'
});

// Start the server
app.listen(5000, () => {
  console.log('App is running on port 5000');
});
