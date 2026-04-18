const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const axios = require('axios');
const multer = require('multer');

const path = require('path');
const fs = require('fs');

const Song = require('./models/Song');
const Movie = require('./models/Movie');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist (Skip/Use /tmp for Vercel)
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel ? '/tmp' : path.join(__dirname, 'uploads');

if (!isVercel && !fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}


// Middleware
const corsOptions = {
    origin: function (origin, callback) {
        // Allow all origins for development to avoid issues with mobile/expo
        callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Health Check for Render/Vercel (NO DB REQUIRED)
app.get('/api/health', (req, res) => {
    res.json({ status: 'alive', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Ensure DB connection for critical API routes
app.use(async (req, res, next) => {
  try {
    const isHealthCheck = req.path === '/api/health' || req.path === '/';
    if (!isHealthCheck) {
        await connectToDatabase();
    }
    next();
  } catch (err) {
    console.error("Critical DB error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});


// Music Discovery Proxy - Triple Redundancy System
app.get('/api/discover', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: "Query is required" });
    
    console.log("Discovery search:", query);
    
    // We try multiple reliable API sources in order
    const sources = [
        `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`,
        `https://jio-savan-api.vercel.app/search/songs?query=${encodeURIComponent(query)}`,
        `https://jiosaavn-api-taupe.vercel.app/search/songs?query=${encodeURIComponent(query)}`
    ];

    for (const url of sources) {
        try {
            const response = await axios.get(url, { timeout: 5000 });
            if (response.data && (response.data.data || response.data.results)) {
                console.log("Success with source:", new URL(url).hostname);
                return res.json(response.data);
            }
        } catch (err) {
            console.warn(`Source ${new URL(url).hostname} failed, trying next...`);
        }
    }

    // FINAL FALLBACK: Simplify query or try trending content
    const finalFallbackQueries = [query.split(' ')[0], 'tamil trending', 'latest hits tamil'];
    for (const fbQuery of finalFallbackQueries) {
        try {
            const response = await axios.get(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(fbQuery)}`, { timeout: 3000 });
            if (response.data && (response.data.data || response.data.results)) {
                return res.json(response.data);
            }
        } catch (e) {
            continue;
        }
    }

    console.error("All discovery sources and fallbacks failed.");
    res.status(503).json({ success: false, message: "Music servers are busy. Please try again." });
});


// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- UPLOAD ROUTE ---
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  
  // Dynamic URL based on where the backend is hosted
  const protocol = req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  
  res.json({ url: fileUrl });
});


// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Watchify';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const opts = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
  };

  cachedDb = await mongoose.connect(MONGO_URI, opts);
  console.log('Connected to MongoDB Atlas');
  return cachedDb;
}

// Initial connection
connectToDatabase().catch(err => console.error('MongoDB connection error:', err));


const Playlist = require('./models/Playlist');
const Favorite = require('./models/Favorite');

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const user = new User({ email, password });
        await user.save();
        res.status(201).json({ success: true, user: { id: user._id, email: user.email } });
    } catch (err) {
        console.error('Registration error detail:', err);
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }

});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        // Fetch favorites and playlists from separate collections
        const favorites = await Favorite.find({ userId: user._id });
        const playlists = await Playlist.find({ userId: user._id });

        res.json({ 
            success: true, 
            user: { 
                id: user._id, 
                email: user.email, 
                favorites: favorites.map(f => f.songData) || [], 
                playlists: playlists || [] 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: 'Login failed' });
    }
});

// --- USER DATA SYNC ROUTES ---
app.get('/api/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const favorites = await Favorite.find({ userId: user._id });
        const playlists = await Playlist.find({ userId: user._id });

        res.json({ 
            success: true, 
            user: { 
                id: user._id, 
                email: user.email, 
                favorites: favorites.map(f => f.songData) || [], 
                playlists: playlists || [] 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch user data' });
    }
});

app.put('/api/user/:id/playlists', async (req, res) => {
    try {
        const { id } = req.params;
        const { playlists } = req.body; // Array of playlist objects
        
        // Option 1: Overwrite all (Simple sync)
        await Playlist.deleteMany({ userId: id });
        
        if (playlists && playlists.length > 0) {
            const docs = playlists.map(p => ({
                userId: id,
                name: p.name,
                songs: p.songs
            }));
            await Playlist.insertMany(docs);
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to sync playlists' });
    }
});

app.put('/api/user/:id/favorites', async (req, res) => {
    try {
        const { id } = req.params;
        const { favorites } = req.body; // Array of song objects
        
        // Simple sync strategy: replace all
        await Favorite.deleteMany({ userId: id });
        
        if (favorites && favorites.length > 0) {
            const docs = favorites.map(song => ({
                userId: id,
                songId: song._id,
                songData: song
            }));
            await Favorite.insertMany(docs);
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to sync favorites' });
    }
});

// --- SONG ROUTES ---
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/songs', async (req, res) => {
  const song = new Song(req.body);
  try {
    const newSong = await song.save();
    res.status(201).json(newSong);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- MOVIE ROUTES ---
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/movies', async (req, res) => {
  const movie = new Movie(req.body);
  try {
    const newMovie = await movie.save();
    res.status(201).json(newMovie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/', (req, res) => {
    res.send('Media Streaming API is running');
});

// Server Start
app.use('/uploads', express.static('uploads'));
app.use("/api/auth", require("./routes/auth"));

// Server Start
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;

