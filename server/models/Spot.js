const mongoose = require('mongoose');

const spotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (val) {
          return val.length === 2;
        },
        message: "Coordinates must be an array of [lng, lat]"
      }
    }
  },
  vibe: { type: String, required: true },
  description: { type: String, required: true },
  images: [String],
  ratings: {
    uniqueness: { type: Number, default: 0 },
    vibe: { type: Number, default: 0 },
    safety: { type: Number, default: 0 },
    crowd: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  compositeScore: { type: Number, default: 0 },
  comments: [
    {
      user: String,
      text: String,
      isAnonymous: Boolean,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdBy: { type: String, default: 'anonymous' },
  createdAt: { type: Date, default: Date.now },
  flagged: { type: Boolean, default: false },
  flags: [
    {
      user: String,
      reason: String,
      date: { type: Date, default: Date.now }
    }
  ]
});

spotSchema.index({ coordinates: '2dsphere' });
spotSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Spot', spotSchema);

