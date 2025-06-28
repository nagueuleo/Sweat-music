const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Song = require('../models/Song');
const Album = require('../models/Album');
const User = require('../models/User');
const PlayHistory = require('../models/PlayHistory');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'audio' ? 'uploads/audio' : 'uploads/images';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for audio field'));
      }
    } else if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for image field'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Admin middleware for all routes
router.use(authMiddleware, adminMiddleware);

// Get admin stats
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalSongs: await Song.countDocuments(),
      totalAlbums: await Album.countDocuments(),
      totalPlays: await PlayHistory.countDocuments(),
      activeUsers: await User.countDocuments({ isBlocked: false }),
      blockedUsers: await User.countDocuments({ isBlocked: true }),
      recentRegistrations: await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      topSongs: await Song.find().sort({ playCount: -1 }).limit(5),
      topGenres: await Song.aggregate([
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Song Management
router.post('/songs', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, artist, album, duration, genre } = req.body;

    if (!title || !artist || !album || !duration || !genre) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!req.files || !req.files.audio) {
      return res.status(400).json({ message: 'Audio file is required.' });
    }

    const audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
    const imageUrl = req.files.image ? `/uploads/images/${req.files.image[0].filename}` : null;

    const song = new Song({
      title,
      artist,
      album,
      duration: parseInt(duration),
      audioUrl,
      imageUrl,
      genre
    });

    await song.save();

    res.status(201).json({
      message: 'Song created successfully.',
      song
    });
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.put('/songs/:id', async (req, res) => {
  try {
    const { title, artist, album, duration, genre } = req.body;
    
    const updates = {};
    if (title) updates.title = title;
    if (artist) updates.artist = artist;
    if (album) updates.album = album;
    if (duration) updates.duration = parseInt(duration);
    if (genre) updates.genre = genre;

    const song = await Song.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!song) {
      return res.status(404).json({ message: 'Song not found.' });
    }

    res.json({
      message: 'Song updated successfully.',
      song
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.delete('/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found.' });
    }

    // Delete associated files
    if (song.audioUrl) {
      const audioPath = path.join(__dirname, '..', song.audioUrl);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }

    if (song.imageUrl) {
      const imagePath = path.join(__dirname, '..', song.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Song.findByIdAndDelete(req.params.id);

    res.json({ message: 'Song deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Album Management
router.post('/albums', upload.single('image'), async (req, res) => {
  try {
    const { title, artist, genre, songs } = req.body;

    if (!title || !artist || !genre) {
      return res.status(400).json({ message: 'Title, artist, and genre are required.' });
    }

    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;

    const album = new Album({
      title,
      artist,
      genre,
      imageUrl,
      songs: songs ? JSON.parse(songs) : []
    });

    await album.save();

    const populatedAlbum = await Album.findById(album._id).populate('songs');

    res.status(201).json({
      message: 'Album created successfully.',
      album: populatedAlbum
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.put('/albums/:id', async (req, res) => {
  try {
    const { title, artist, genre, songs } = req.body;
    
    const updates = {};
    if (title) updates.title = title;
    if (artist) updates.artist = artist;
    if (genre) updates.genre = genre;
    if (songs) updates.songs = JSON.parse(songs);

    const album = await Album.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('songs');

    if (!album) {
      return res.status(404).json({ message: 'Album not found.' });
    }

    res.json({
      message: 'Album updated successfully.',
      album
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.delete('/albums/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ message: 'Album not found.' });
    }

    // Delete associated image
    if (album.imageUrl) {
      const imagePath = path.join(__dirname, '..', album.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Album.findByIdAndDelete(req.params.id);

    res.json({ message: 'Album deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User blocked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/users/:id/unblock', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User unblocked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/users/:id/promote', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User promoted to admin successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;