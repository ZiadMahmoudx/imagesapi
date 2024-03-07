const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Use CORS middleware
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Image schema and model
const imageSchema = new mongoose.Schema({
  title: String
});

const Image = mongoose.model('Image', imageSchema);

// Middleware
app.use(bodyParser.json());

// Routes
// Get all images
app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new image
app.post('/images', async (req, res) => {
  const { title } = req.body;
  try {
    const newImage = new Image({ title });
    await newImage.save();
    res.status(201).json(newImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an image by ID
app.put('/images/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    const updatedImage = await Image.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );
    res.json(updatedImage);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Delete an image by ID
app.delete('/images/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedImage = await Image.findByIdAndDelete(id);
    if (!deletedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json({ message: 'Image deleted', image: deletedImage });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
