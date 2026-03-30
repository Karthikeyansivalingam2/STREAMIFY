const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnail: { type: String, required: true },
  category: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
