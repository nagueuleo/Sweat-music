const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  genre: {
    type: String,
    required: true,
    enum: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Other']
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }]
}, {
  timestamps: true
});

// Indexes
albumSchema.index({ title: 'text', artist: 'text' });
albumSchema.index({ genre: 1 });

module.exports = mongoose.model('Album', albumSchema);