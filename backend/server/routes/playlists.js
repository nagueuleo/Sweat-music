const express = require('express');
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

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

// Get user's playlists
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate('songs')
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get public playlists
router.get('/public', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ isPublic: true })
      .populate('songs')
      .populate('owner', 'username email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get playlist by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('songs')
      .populate('owner', 'username email')
      .populate('followers', 'username email');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    // Check if user can access this playlist
    if (!playlist.isPublic && playlist.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Create playlist with optional image upload
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Playlist name is required.' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/images/${req.file.filename}`;
    }

    const playlist = new Playlist({
      name,
      description: description || '',
      isPublic: isPublic || false,
      owner: req.user._id,
      songs: [],
      imageUrl
    });

    await playlist.save();

    // Add playlist to user's playlists
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { playlists: playlist._id }
    });

    const populatedPlaylist = await Playlist.findById(playlist._id)
      .populate('owner', 'username email');

    res.status(201).json({
      message: 'Playlist created successfully.',
      playlist: populatedPlaylist
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update playlist
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (req.file) {
      updates.imageUrl = `/uploads/images/${req.file.filename}`;
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('songs').populate('owner', 'username email');

    res.json({
      message: 'Playlist updated successfully.',
      playlist: updatedPlaylist
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete playlist
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    // Remove playlist from user's playlists
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { playlists: req.params.id }
    });

    res.json({ message: 'Playlist deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Add song to playlist
router.post('/:id/songs', authMiddleware, async (req, res) => {
  try {
    const { songId } = req.body;

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Check if song is already in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song already in playlist.' });
    }

    // Add song to playlist
    await Playlist.findByIdAndUpdate(req.params.id, {
      $addToSet: { songs: songId }
    });

    res.json({ message: 'Song added to playlist successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Remove song from playlist
    await Playlist.findByIdAndUpdate(req.params.id, {
      $pull: { songs: req.params.songId }
    });

    res.json({ message: 'Song removed from playlist successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Follow playlist
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    if (!playlist.isPublic) {
      return res.status(403).json({ message: 'Cannot follow private playlist.' });
    }

    // Check if already following
    if (playlist.followers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already following this playlist.' });
    }

    // Add follower
    await Playlist.findByIdAndUpdate(req.params.id, {
      $addToSet: { followers: req.user._id }
    });

    res.json({ message: 'Playlist followed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Unfollow playlist
router.delete('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    // Remove follower
    await Playlist.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id }
    });

    res.json({ message: 'Playlist unfollowed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;