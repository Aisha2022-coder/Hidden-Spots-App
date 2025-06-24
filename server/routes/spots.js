const express = require('express');
const router = express.Router();
const Spot = require('../models/Spot');
const { upload } = require('../config/cloudinary');

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { name, vibe, description = '', coordinates } = req.body;
    if (!name || !coordinates || !vibe || !description) {
      return res.status(400).json({ message: 'Validation Error: name, coordinates, and vibe are required fields.' });
    }
    let parsedCoordinates;
    try {
      parsedCoordinates = JSON.parse(coordinates);
    } catch (e) {
      return res.status(400).json({ message: 'Validation Error: Invalid format for coordinates. It must be a valid JSON string (e.g., {"type":"Point","coordinates":[lng, lat]}).' });
    }
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
    }
    const newSpot = new Spot({
      name,
      vibe,
      description,
      coordinates: parsedCoordinates,
      images: imageUrls,
      compositeScore: 0,
    });
    const saved = await newSpot.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error saving spot:", err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: `Mongoose Validation Error: ${err.message}` });
    }
    res.status(500).json({ message: 'An internal server error occurred while saving the spot.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius, vibe, safety, crowd, keyword } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Validation Error: Missing required lat or lng query parameters." });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "Validation Error: Latitude and longitude must be numbers." });
    }

    let maxDistance = 1000000;
    if (radius && radius.trim() && !isNaN(Number(radius))) {
      maxDistance = Number(radius) * 1000;
    } else if (radius && radius.trim()) {
      return res.status(400).json({ message: 'Validation Error: radius must be a number.' });
    }

    let geoFilter = {
      coordinates: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: maxDistance
        }
      }
    };

    let andFilters = [geoFilter];
    if (vibe && vibe.trim()) {
      andFilters.push({ vibe: new RegExp(`^${vibe.trim().replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, 'i') });
    }
    if (safety && safety.trim() && !isNaN(Number(safety))) {
      andFilters.push({ 'ratings.safety': { $gte: Number(safety) } });
    }
    if (crowd && crowd.trim() && !isNaN(Number(crowd))) {
      andFilters.push({ 'ratings.crowd': { $lte: Number(crowd) } });
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.trim();
      const wordRegex = kw.split(/\s+/).join('|');
      andFilters.push({
        $or: [
          { name: { $regex: wordRegex, $options: 'i' } },
          { description: { $regex: wordRegex, $options: 'i' } }
        ]
      });
    }

    let finalFilter = andFilters.length > 0 ? { $and: andFilters } : {};

    let spots = await Spot.find(finalFilter);
    res.json(spots);
  } catch (err) {
    console.error("❌ Mongo error:", err.message);
    res.json([]);
  }
});

router.get('/top', async (req, res) => {
  try {
    const spots = await Spot.aggregate([
      {
        $addFields: {
          score: {
            $cond: {
              if: { $isNumber: "$compositeScore" },
              then: "$compositeScore",
              else: 0
            }
          }
        }
      },
      { $sort: { score: -1 } }
    ]);
    res.json(spots);
  } catch (err) {
    console.error("❌ Error in /feed route:", err.message);
    res.status(500).json({ message: 'Error fetching feed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ message: 'Cannot find spot' });
    }
    res.json(spot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/ratings', async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ message: 'Cannot find spot' });
    }
    const { uniqueness, vibe, safety, crowd } = req.body;
    let count = spot.ratings.count || 0;
    function avg(oldVal, newVal) {
      return ((oldVal * count) + (newVal || 0)) / (count + 1);
    }
    spot.ratings.uniqueness = avg(spot.ratings.uniqueness, uniqueness);
    spot.ratings.vibe = avg(spot.ratings.vibe, vibe);
    spot.ratings.safety = avg(spot.ratings.safety, safety);
    spot.ratings.crowd = avg(spot.ratings.crowd, crowd);
    spot.ratings.count = count + 1;
    spot.compositeScore = (
      (spot.ratings.uniqueness + spot.ratings.vibe + spot.ratings.safety + spot.ratings.crowd) / 4
    );
    const updatedSpot = await spot.save();
    res.json(updatedSpot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ message: 'Cannot find spot' });
    }

    spot.comments.push(req.body);
    const updatedSpot = await spot.save();
    res.status(201).json(updatedSpot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/flag', async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });
    const { user = 'anonymous', reason = 'Inappropriate content' } = req.body;
    spot.flagged = true;
    spot.flags.push({ user, reason });
    await spot.save();
    res.json({ message: 'Spot flagged for review.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to flag spot.' });
  }
});

router.get('/flagged', async (req, res) => {
  try {
    const spots = await Spot.find({ flagged: true });
    res.json(spots);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch flagged spots.' });
  }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });
    spot.flagged = false;
    spot.flags = [];
    await spot.save();
    res.json({ message: 'Spot approved and restored.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve spot.' });
  }
});

router.delete('/:id/remove', async (req, res) => {
  try {
    const spot = await Spot.findByIdAndDelete(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });
    res.json({ message: 'Spot removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove spot.' });
  }
});

module.exports = router;

