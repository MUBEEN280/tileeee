const express = require('express');
const router = express.Router();
const TileSubmission = require('../models/TileSubmission');

// Create new TileSubmission
router.post('/', async (req, res) => {
  try {
    const tileSubmission = new TileSubmission(req.body);
    const saved = await tileSubmission.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all TileSubmissions
router.get('/', async (req, res) => {
  try {
    const submissions = await TileSubmission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a TileSubmission by id
router.put('/:id', async (req, res) => {
  try {
    const updated = await TileSubmission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
