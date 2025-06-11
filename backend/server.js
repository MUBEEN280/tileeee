const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const tileSubmissionsRoutes = require('./routes/tileSubmissionRoutes');
dotenv.config(); // load .env file

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/tilesubmissions', tileSubmissionsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Server & MongoDB connected!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
