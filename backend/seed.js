const mongoose = require('mongoose');
const Song = require('./models/Song');
const Movie = require('./models/Movie');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/media-stream';

const songs = [
  {
    title: "Midnight City",
    artist: "M83",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&h=400"
  },
  {
    title: "Starlight Voyage",
    artist: "The Void",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&h=400"
  },
  {
    title: "Cyberpunk Dreams",
    artist: "Neon Echo",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&h=400"
  }
];

const movies = [
  {
    title: "The Great Outdoors",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&h=450",
    category: "Nature"
  },
  {
    title: "Deep Space",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&h=450",
    category: "Science"
  },
  {
    title: "Urban Skyline",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&h=450",
    category: "Documentary"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Seeding started...");
    
    await Song.deleteMany({});
    await Movie.deleteMany({});
    
    await Song.insertMany(songs);
    await Movie.insertMany(movies);
    
    console.log("Database seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDB();
