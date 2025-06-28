const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();
const axios = require('axios');

// Get user by ID (for inter-service population)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all users (admin or for population)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) delete updates.password;
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'Profile updated.', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Follow user
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.followers.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already following.' });
    }
    user.followers.push(req.user.userId);
    await user.save();
    await User.findByIdAndUpdate(req.user.userId, { $addToSet: { following: user._id } });
    res.json({ message: 'Followed user.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Unfollow user
router.post('/:id/unfollow', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.followers = user.followers.filter(f => f.toString() !== req.user.userId);
    await user.save();
    await User.findByIdAndUpdate(req.user.userId, { $pull: { following: user._id } });
    res.json({ message: 'Unfollowed user.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Liked songs (get, add, remove)
router.get('/liked-songs', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const likedSongIds = user.likedSongs || [];
    // Fetch song details from music-service
    const token = req.headers['authorization']?.split(' ')[1];
    const songs = await Promise.all(likedSongIds.map(async (id) => {
      try {
        const resp = await axios.get(`http://music-service:3003/api/songs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return resp.data;
      } catch {
        return null;
      }
    }));
    res.json(songs.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/liked-songs', authMiddleware, async (req, res) => {
  try {
    const { songId } = req.body;
    await User.findByIdAndUpdate(req.user.userId, { $addToSet: { likedSongs: songId } });
    res.json({ message: 'Song liked.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.delete('/liked-songs/:songId', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, { $pull: { likedSongs: req.params.songId } });
    res.json({ message: 'Song unliked.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update user by id (admin or self)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const updates = req.body;
    if (updates.password) delete updates.password;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User updated.', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete user by id (admin or self)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 