const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    name: String,
    avatar: String,
    googleId: String,
    favorites: [], // Store full song objects for cross-device consistency

    playlists: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        songs: [] // Store full song objects
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
