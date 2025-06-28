const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get user profile
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username email profileImage')
      .populate('following', 'username email profileImage')
      .populate('playlists');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if current user is following this user
    const isFollowing = user.followers.some(
      follower => follower._id.toString() === req.user._id.toString()
    );

    const userProfile = {
      ...user.toObject(),
      isFollowing
    };

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, profileImage } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (profileImage) updates.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully.',
      user
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already taken.` 
      });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// Follow user
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    // Check if already following
    if (req.user.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already following this user.' });
    }

    // Add to following list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { following: req.params.id }
    });

    // Add to followers list
    await User.findByIdAndUpdate(req.params.id, {
      $addToSet: { followers: req.user._id }
    });

    res.json({ message: 'User followed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Unfollow user
router.delete('/:id/unfollow', authMiddleware, async (req, res) => {
  try {
    // Remove from following list
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.id }
    });

    // Remove from followers list
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id }
    });

    res.json({ message: 'User unfollowed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get followers
router.get('/followers', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username email profileImage');

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get following
router.get('/following', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('following', 'username email profileImage');

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Search users
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required.' });
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user._id } }, // Exclude current user
        { isBlocked: false } // Exclude blocked users
      ]
    })
    .select('username email profileImage')
    .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;