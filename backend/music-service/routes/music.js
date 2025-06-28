const express = require('express');
const Song = require('../models/Song');
const Album = require('../models/Album');
const PlayHistory = require('../models/PlayHistory');
const { authMiddleware } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for audio and image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'audio' ? 'uploads/audio' : 'uploads/images';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// SONGS CRUD
// Get all songs (public)
router.get('/songs', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json({ songs });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Get song by ID (public)
router.get('/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found.' });
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Create song (with audio/image upload)
router.post('/songs', authMiddleware, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, artist, album, duration, genre } = req.body;
    if (!title || !artist || !album || !duration || !genre || !req.files.audio) {
      return res.status(400).json({ message: 'All fields and audio are required.' });
    }
    const audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
    const imageUrl = req.files.image ? `/uploads/images/${req.files.image[0].filename}` : null;
    const song = new Song({
      title, artist, album, duration: parseInt(duration), genre, audioUrl, imageUrl
    });
    await song.save();
    res.status(201).json({ message: 'Song created.', song });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Update song
router.put('/songs/:id', authMiddleware, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const updates = req.body;
    if (req.files.audio) updates.audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
    if (req.files.image) updates.imageUrl = `/uploads/images/${req.files.image[0].filename}`;
    const song = await Song.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!song) return res.status(404).json({ message: 'Song not found.' });
    res.json({ message: 'Song updated.', song });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Delete song
router.delete('/songs/:id', authMiddleware, async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found.' });
    res.json({ message: 'Song deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Like a song
router.post('/songs/:id/like', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found.' });
    if (!song.likes.includes(userId)) song.likes.push(userId);
    await song.save();
    res.json({ message: 'Song liked.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Unlike a song
router.delete('/songs/:id/like', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found.' });
    song.likes = song.likes.filter(id => id.toString() !== userId);
    await song.save();
    res.json({ message: 'Song unliked.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ALBUMS CRUD
// Get all albums
router.get('/albums', authMiddleware, async (req, res) => {
  try {
    const albums = await Album.find().sort({ createdAt: -1 });
    res.json({ albums });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Get album by ID
router.get('/albums/:id', authMiddleware, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate('songs');
    if (!album) return res.status(404).json({ message: 'Album not found.' });
    res.json(album);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Create album (with image upload)
router.post('/albums', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, artist, genre, songs } = req.body;
    if (!title || !artist || !genre) {
      return res.status(400).json({ message: 'Title, artist, and genre are required.' });
    }
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;
    const album = new Album({
      title, artist, genre, imageUrl, songs: songs ? JSON.parse(songs) : []
    });
    await album.save();
    res.status(201).json({ message: 'Album created.', album });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Update album
router.put('/albums/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) updates.imageUrl = `/uploads/images/${req.file.filename}`;
    if (updates.songs) updates.songs = JSON.parse(updates.songs);
    const album = await Album.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!album) return res.status(404).json({ message: 'Album not found.' });
    res.json({ message: 'Album updated.', album });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Delete album
router.delete('/albums/:id', authMiddleware, async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found.' });
    res.json({ message: 'Album deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PLAY HISTORY
// Get user's play history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await PlayHistory.find({ user: req.user.userId }).populate('song').sort({ playedAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Add to play history
router.post('/history', authMiddleware, async (req, res) => {
  try {
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ message: 'Song ID required.' });
    const entry = new PlayHistory({ user: req.user.userId, song: songId });
    await entry.save();
    res.status(201).json({ message: 'Added to play history.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get liked songs for the current user
router.get('/liked-songs', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const likedSongs = await Song.find({ likes: userId });
    res.json(likedSongs);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 