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

const app = express();
const PORT = process.env.PORT || 5000;

// Music Discovery Proxy (Bypass CORS)
app.get('/api/discover', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: "Query is required" });
    
    try {
        const response = await axios.get(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`);
        // We only care about the inner response
        return res.json(response.data);
    } catch (err) {
        console.error("Discovery Primary Error, trying secondary...");
        try {
            const fallback = await axios.get(`https://saavn.me/api/search/songs?query=${encodeURIComponent(query)}`);
            return res.json(fallback.data);
        } catch (e) {
            console.error("Discovery Final Error:", e.message);
            return res.status(500).json({ success: false, message: "Music search error" });
        }
    }

});

// Create uploads directory if it doesn't exist

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Middleware
const corsOptions = {
    origin: '*', // Allow all for now during debug
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));


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
