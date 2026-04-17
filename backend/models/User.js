const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    favorites: [{
        type: String // You can store strings or mixed
    }],
    playlists: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        songs: [] // Store mixed objects or strings representing the array of songs
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
