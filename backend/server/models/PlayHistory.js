const mongoose = require('mongoose');

const playHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
playHistorySchema.index({ userId: 1, playedAt: -1 });
playHistorySchema.index({ songId: 1 });

module.exports = mongoose.model('PlayHistory', playHistorySchema);