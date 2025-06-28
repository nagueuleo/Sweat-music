const express = require('express');
const Song = require('../models/Song');
const Album = require('../models/Album');
const PlayHistory = require('../models/PlayHistory');
const Like = require('../models/Like');
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get all songs with pagination
router.get('/songs', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const songs = await Song.find()
      .sort({ playCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Song.countDocuments();

    res.json({
      songs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get song by ID
router.get('/songs/:id', authMiddleware, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found.' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Search songs and albums
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q, genre } = req.query;
    let searchQuery = {};

    if (q) {
      searchQuery.$text = { $search: q };
    }

    if (genre) {
      searchQuery.genre = genre;
    }

    const songs = await Song.find(searchQuery)
      .sort({ playCount: -1 })
      .limit(50);

    const albums = await Album.find(searchQuery)
      .populate('songs')
      .limit(20);

    res.json({ songs, albums });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all albums
router.get('/albums', authMiddleware, async (req, res) => {
  try {
    const albums = await Album.find()
      .populate('songs')
      .sort({ createdAt: -1 });

    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get album by ID
router.get('/albums/:id', authMiddleware, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate('songs');
    if (!album) {
      return res.status(404).json({ message: 'Album not found.' });
    }
    res.json(album);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Like a song
router.post('/songs/:id/like', authMiddleware, async (req, res) => {
  try {
    const songId = req.params.id;
    const userId = req.user._id;

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found.' });
    }

    // Check if already liked
    const existingLike = await Like.findOne({ userId, songId });
    if (existingLike) {
      return res.status(400).json({ message: 'Song already liked.' });
    }

    // Create like
    const like = new Like({ userId, songId });
    await like.save();

    // Update song likes count
    await Song.findByIdAndUpdate(songId, { $inc: { likes: 1 } });

    // Add to user's liked songs
    await User.findByIdAndUpdate(userId, { $addToSet: { likedSongs: songId } });

    res.json({ message: 'Song liked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Unlike a song
router.delete('/songs/:id/like', authMiddleware, async (req, res) => {
  try {
    const songId = req.params.id;
    const userId = req.user._id;

    // Remove like
    const deletedLike = await Like.findOneAndDelete({ userId, songId });
    if (!deletedLike) {
      return res.status(400).json({ message: 'Song not liked.' });
    }

    // Update song likes count
    await Song.findByIdAndUpdate(songId, { $inc: { likes: -1 } });

    // Remove from user's liked songs
    await User.findByIdAndUpdate(userId, { $pull: { likedSongs: songId } });

    res.json({ message: 'Song unliked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get liked songs
router.get('/liked-songs', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('likedSongs');
    res.json(user.likedSongs);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Record song play
router.post('/play', authMiddleware, async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user._id;

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found.' });
    }

    // Record play history
    const playHistory = new PlayHistory({ userId, songId });
    await playHistory.save();

    // Update song play count
    await Song.findByIdAndUpdate(songId, { $inc: { playCount: 1 } });

    // Add to user's recently played
    const user = await User.findById(userId);
    await user.addToRecentlyPlayed(songId);

    res.json({ message: 'Play recorded successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get play history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await PlayHistory.find({ userId: req.user._id })
      .populate('songId')
      .sort({ playedAt: -1 })
      .limit(100);

    const formattedHistory = history.map(h => ({
      _id: h._id,
      song: h.songId,
      playedAt: h.playedAt
    }));

    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get recently played songs
router.get('/recently-played', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('recentlyPlayed.songId')
      .exec();

    const recentlyPlayed = user.recentlyPlayed
      .filter(item => item.songId) // Filter out null references
      .map(item => ({
        song: item.songId,
        playedAt: item.playedAt
      }));

    res.json(recentlyPlayed);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get recommendations
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's liked songs to understand preferences
    const user = await User.findById(userId).populate('likedSongs');
    const likedGenres = [...new Set(user.likedSongs.map(song => song.genre))];

    // Get user's play history to understand listening patterns
    const recentPlays = await PlayHistory.find({ userId })
      .populate('songId')
      .sort({ playedAt: -1 })
      .limit(50);

    const recentGenres = [...new Set(recentPlays.map(p => p.songId.genre))];
    const preferredGenres = [...new Set([...likedGenres, ...recentGenres])];

    // Get songs from preferred genres that user hasn't liked
    let recommendations = [];
    
    if (preferredGenres.length > 0) {
      recommendations = await Song.find({
        genre: { $in: preferredGenres },
        _id: { $nin: user.likedSongs.map(s => s._id) }
      })
      .sort({ playCount: -1, likes: -1 })
      .limit(20);
    }

    // If not enough recommendations, add popular songs
    if (recommendations.length < 10) {
      const popularSongs = await Song.find({
        _id: { $nin: [...user.likedSongs.map(s => s._id), ...recommendations.map(r => r._id)] }
      })
      .sort({ playCount: -1, likes: -1 })
      .limit(20 - recommendations.length);

      recommendations = [...recommendations, ...popularSongs];
    }

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Export listening stats
router.get('/export-stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's play history with song details
    const history = await PlayHistory.find({ userId })
      .populate('songId')
      .sort({ playedAt: -1 });

    // Create CSV content
    const csvHeader = 'Song Title,Artist,Album,Genre,Played At,Play Count\n';
    const csvRows = history.map(h => {
      const song = h.songId;
      return `"${song.title}","${song.artist}","${song.album}","${song.genre}","${h.playedAt.toISOString()}","${song.playCount}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="listening-stats.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;