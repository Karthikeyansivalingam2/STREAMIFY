const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  url: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, default: 'music' }
}, { timestamps: true, collection: 'musics' });

module.exports = mongoose.model('Song', songSchema);
