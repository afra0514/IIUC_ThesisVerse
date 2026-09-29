const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.send('IIUC ThesisVerse Server is Running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});