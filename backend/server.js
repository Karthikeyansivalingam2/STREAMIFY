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

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Middleware
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5000',
            'https://streamify-neon.vercel.app',
            'https://streamify-media.vercel.app'
        ];
        
        // Allow all vercel subdomains and local development
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app') || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Health Check for Render Deployment
app.get('/api/health', (req, res) => {
    res.json({ status: 'alive', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
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

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas: Watchify'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        
        // Create new user (In production, hash the password using bcrypt!)
        const newUser = new User({ email, password });
        await newUser.save();
        
        res.status(201).json({ success: true, message: 'User created successfully', user: { id: newUser._id, email: newUser.email } });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password (In production, compare hashes!)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Success
        res.json({ success: true, message: 'Logged in successfully', user: { id: user._id, email: user.email } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: 'Server error during login' });
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
