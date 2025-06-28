const express = require("express");
const Song = require("../models/Song");
const Album = require("../models/Album");
const PlayHistory = require("../models/PlayHistory");
const Like = require("../models/Like");
const User = require("../models/User");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "audio") {
      cb(null, path.join(__dirname, "../../uploads/audio"));
    } else if (file.fieldname === "image") {
      cb(null, path.join(__dirname, "../../uploads/images"));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === "audio") {
      if (file.mimetype.startsWith("audio/")) {
        cb(null, true);
      } else {
        cb(new Error("Only audio files are allowed for audio field"));
      }
    } else if (file.fieldname === "image") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for image field"));
      }
    }
  },
});

// Admin routes for song management
router.post(
  "/songs",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, artist, album, duration, genre } = req.body;

      if (!title || !artist || !album || !duration || !genre) {
        return res.status(400).json({ message: "All fields are required." });
      }

      if (!req.files || !req.files.audio) {
        return res.status(400).json({ message: "Audio file is required." });
      }

      const audioFile = req.files.audio[0];
      const imageFile = req.files.image ? req.files.image[0] : null;

      const song = new Song({
        title,
        artist,
        album,
        duration: parseInt(duration),
        genre,
        audioUrl: `/uploads/audio/${audioFile.filename}`,
        imageUrl: imageFile ? `/uploads/images/${imageFile.filename}` : null,
        playCount: 0,
        likes: 0,
      });

      await song.save();
      res.status(201).json(song);
    } catch (error) {
      console.error("Error creating song:", error);
      res.status(500).json({ message: "Server error creating song." });
    }
  }
);

router.put("/songs/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, artist, album, duration, genre } = req.body;
    const songId = req.params.id;

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    const updates = {};
    if (title) updates.title = title;
    if (artist) updates.artist = artist;
    if (album) updates.album = album;
    if (duration) updates.duration = parseInt(duration);
    if (genre) updates.genre = genre;

    const updatedSong = await Song.findByIdAndUpdate(songId, updates, {
      new: true,
    });
    res.json(updatedSong);
  } catch (error) {
    console.error("Error updating song:", error);
    res.status(500).json({ message: "Server error updating song." });
  }
});

router.delete(
  "/songs/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const songId = req.params.id;

      const song = await Song.findById(songId);
      if (!song) {
        return res.status(404).json({ message: "Song not found." });
      }

      // Delete associated likes and play history
      await Like.deleteMany({ songId });
      await PlayHistory.deleteMany({ songId });

      // Remove from user's liked songs
      await User.updateMany(
        { likedSongs: songId },
        { $pull: { likedSongs: songId } }
      );

      await Song.findByIdAndDelete(songId);
      res.json({ message: "Song deleted successfully." });
    } catch (error) {
      console.error("Error deleting song:", error);
      res.status(500).json({ message: "Server error deleting song." });
    }
  }
);

// Admin routes for album management
router.post(
  "/albums",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, artist, genre } = req.body;

      if (!title || !artist || !genre) {
        return res
          .status(400)
          .json({ message: "Title, artist, and genre are required." });
      }

      const album = new Album({
        title,
        artist,
        genre,
        imageUrl: req.file ? `/uploads/images/${req.file.filename}` : null,
        songs: [],
      });

      await album.save();
      res.status(201).json(album);
    } catch (error) {
      console.error("Error creating album:", error);
      res.status(500).json({ message: "Server error creating album." });
    }
  }
);

router.put("/albums/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, artist, genre } = req.body;
    const albumId = req.params.id;

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: "Album not found." });
    }

    const updates = {};
    if (title) updates.title = title;
    if (artist) updates.artist = artist;
    if (genre) updates.genre = genre;

    const updatedAlbum = await Album.findByIdAndUpdate(albumId, updates, {
      new: true,
    });
    res.json(updatedAlbum);
  } catch (error) {
    console.error("Error updating album:", error);
    res.status(500).json({ message: "Server error updating album." });
  }
});

router.delete(
  "/albums/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const albumId = req.params.id;

      const album = await Album.findById(albumId);
      if (!album) {
        return res.status(404).json({ message: "Album not found." });
      }

      // Remove album reference from songs
      await Song.updateMany({ album: album.title }, { $unset: { album: "" } });

      await Album.findByIdAndDelete(albumId);
      res.json({ message: "Album deleted successfully." });
    } catch (error) {
      console.error("Error deleting album:", error);
      res.status(500).json({ message: "Server error deleting album." });
    }
  }
);

// Get all songs with pagination
router.get("/songs", authMiddleware, async (req, res) => {
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
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Get song by ID
router.get("/songs/:id", authMiddleware, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Search songs and albums
router.get("/search", authMiddleware, async (req, res) => {
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

    const albums = await Album.find(searchQuery).populate("songs").limit(20);

    res.json({ songs, albums });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Get all albums
router.get("/albums", authMiddleware, async (req, res) => {
  try {
    const albums = await Album.find().populate("songs").sort({ createdAt: -1 });

    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Get album by ID
router.get("/albums/:id", authMiddleware, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate("songs");
    if (!album) {
      return res.status(404).json({ message: "Album not found." });
    }
    res.json(album);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Like a song
router.post("/songs/:id/like", authMiddleware, async (req, res) => {
  try {
    const songId = req.params.id;
    const userId = req.user._id;

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    // Check if already liked
    const existingLike = await Like.findOne({ userId, songId });
    if (existingLike) {
      return res.status(400).json({ message: "Song already liked." });
    }

    // Create like
    const like = new Like({ userId, songId });
    await like.save();

    // Update song likes count
    await Song.findByIdAndUpdate(songId, { $inc: { likes: 1 } });

    // Add to user's liked songs
    await User.findByIdAndUpdate(userId, { $addToSet: { likedSongs: songId } });

    res.json({ message: "Song liked successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Unlike a song
router.delete("/songs/:id/like", authMiddleware, async (req, res) => {
  try {
    const songId = req.params.id;
    const userId = req.user._id;

    // Remove like
    const deletedLike = await Like.findOneAndDelete({ userId, songId });
    if (!deletedLike) {
      return res.status(400).json({ message: "Song not liked." });
    }

    // Update song likes count
    await Song.findByIdAndUpdate(songId, { $inc: { likes: -1 } });

    // Remove from user's liked songs
    await User.findByIdAndUpdate(userId, { $pull: { likedSongs: songId } });

    res.json({ message: "Song unliked successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Get liked songs
router.get("/liked-songs", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("likedSongs");
    res.json(user.likedSongs);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Record song play
router.post("/play", authMiddleware, async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user._id;

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    // Record play history
    const playHistory = new PlayHistory({ userId, songId });
    await playHistory.save();

    // Update song play count
    await Song.findByIdAndUpdate(songId, { $inc: { playCount: 1 } });

    // Add to user's recently played
    const user = await User.findById(userId);
    await user.addToRecentlyPlayed(songId);

    res.json({ message: "Play recorded successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Get play history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await PlayHistory.find({ userId: req.user._id })
      .populate("songId")
      .sort({ playedAt: -1 })
      .limit(100);

    const formattedHistory = history.map((h) => ({
      _id: h._id,
      song: h.songId,
      playedAt: h.playedAt,
    }));

    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Get recently played songs
router.get("/recently-played", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("recentlyPlayed.songId")
      .exec();

    const recentlyPlayed = user.recentlyPlayed
      .filter((item) => item.songId) // Filter out null references
      .map((item) => ({
        song: item.songId,
        playedAt: item.playedAt,
      }));

    res.json(recentlyPlayed);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Get recommendations
router.get("/recommendations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's liked songs to understand preferences
    const user = await User.findById(userId).populate("likedSongs");
    const likedGenres = [...new Set(user.likedSongs.map((song) => song.genre))];

    // Get user's play history to understand listening patterns
    const recentPlays = await PlayHistory.find({ userId })
      .populate("songId")
      .sort({ playedAt: -1 })
      .limit(50);

    const recentGenres = [...new Set(recentPlays.map((p) => p.songId.genre))];
    const preferredGenres = [...new Set([...likedGenres, ...recentGenres])];

    // Get songs from preferred genres that user hasn't liked
    let recommendations = [];

    if (preferredGenres.length > 0) {
      recommendations = await Song.find({
        genre: { $in: preferredGenres },
        _id: { $nin: user.likedSongs.map((s) => s._id) },
      })
        .sort({ playCount: -1, likes: -1 })
        .limit(20);
    }

    // If not enough recommendations, add popular songs
    if (recommendations.length < 10) {
      const popularSongs = await Song.find({
        _id: {
          $nin: [
            ...user.likedSongs.map((s) => s._id),
            ...recommendations.map((r) => r._id),
          ],
        },
      })
        .sort({ playCount: -1, likes: -1 })
        .limit(20 - recommendations.length);

      recommendations = [...recommendations, ...popularSongs];
    }

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Export listening stats
router.get("/export-stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's play history with song details
    const history = await PlayHistory.find({ userId })
      .populate("songId")
      .sort({ playedAt: -1 });

    // Create CSV content
    const csvHeader = "Song Title,Artist,Album,Genre,Played At,Play Count\n";
    const csvRows = history
      .map((h) => {
        const song = h.songId;
        return `"${song.title}","${song.artist}","${song.album}","${
          song.genre
        }","${h.playedAt.toISOString()}","${song.playCount}"`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="listening-stats.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
