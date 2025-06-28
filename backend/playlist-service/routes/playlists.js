const express = require('express');
const Playlist = require('../models/Playlist');
// User and Song models will be proxied or stubbed for now
const { authMiddleware } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const axios = require('axios');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Utility to fetch user by ID from user-service
async function fetchUser(userId, token) {
  try {
    const res = await axios.get(`http://user-service:3002/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch {
    return null;
  }
}
// Utility to fetch song by ID from music-service
async function fetchSong(songId, token) {
  try {
    const res = await axios.get(`http://music-service:3003/api/songs/${songId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch {
    return null;
  }
}
// Utility to populate playlist owner and songs
async function populatePlaylist(playlist, token) {
  const owner = await fetchUser(playlist.owner, token);
  const songs = (await Promise.all((playlist.songs || []).map(id => fetchSong(id, token)))).filter(Boolean);
  return { ...playlist.toObject(), owner, songs };
}

// Get user's playlists
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user.userId })
      .sort({ createdAt: -1 });
    const populated = await Promise.all(playlists.map(p => populatePlaylist(p, req.headers['authorization']?.split(' ')[1])));
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Get playlist by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found.' });
    // Check if user can access this playlist
    if (!playlist.isPublic && playlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const populated = await populatePlaylist(playlist, req.headers['authorization']?.split(' ')[1]);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Get public playlists
router.get('/public', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ isPublic: true }).sort({ createdAt: -1 });
    const populated = await Promise.all(playlists.map(p => populatePlaylist(p, req.headers['authorization']?.split(' ')[1])));
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Get all playlists (admin/global)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find().sort({ createdAt: -1 });
    const populated = await Promise.all(playlists.map(p => populatePlaylist(p, req.headers['authorization']?.split(' ')[1])));
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Add song to playlist
router.post('/:id/songs', authMiddleware, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found.' });
    if (playlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    // Validate song exists in music service
    const token = req.headers['authorization']?.split(' ')[1];
    const song = await fetchSong(songId, token);
    if (!song) {
      return res.status(400).json({ message: 'Song does not exist.' });
    }
    if (playlist.songs.some(s => s.toString() === songId)) {
      return res.status(400).json({ message: 'Song already in playlist.' });
    }
    playlist.songs.push(songId);
    await playlist.save();
    res.json({ message: 'Song added to playlist.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Remove song from playlist
router.delete('/:id/songs/:songId', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found.' });
    if (playlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    playlist.songs = playlist.songs.filter(s => s.toString() !== req.params.songId);
    await playlist.save();
    res.json({ message: 'Song removed from playlist.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Follow playlist
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found.' });
    if (!playlist.isPublic) {
      return res.status(403).json({ message: 'Cannot follow private playlist.' });
    }
    if (playlist.followers.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already following this playlist.' });
    }
    playlist.followers.push(req.user.userId);
    await playlist.save();
    res.json({ message: 'Followed playlist.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Unfollow playlist
router.post('/:id/unfollow', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found.' });
    playlist.followers = playlist.followers.filter(f => f.toString() !== req.user.userId);
    await playlist.save();
    res.json({ message: 'Unfollowed playlist.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Create playlist
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, isPublic } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;
    const playlist = new Playlist({
      name,
      isPublic: isPublic ?? true,
      owner: req.user.userId,
      songs: [],
      followers: [],
      imageUrl
    });
    await playlist.save();
    res.status(201).json({ message: 'Playlist created.', playlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Update playlist
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found.' });
    if (playlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const updates = req.body;
    if (req.file) updates.imageUrl = `/uploads/images/${req.file.filename}`;
    Object.assign(playlist, updates);
    await playlist.save();
    const populated = await populatePlaylist(playlist, req.headers['authorization']?.split(' ')[1]);
    res.json({ message: 'Playlist updated.', playlist: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Delete playlist
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found.' });
    if (playlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    await playlist.deleteOne();
    res.json({ message: 'Playlist deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 