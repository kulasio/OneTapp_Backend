const mongoose = require('mongoose');

const tapLogSchema = new mongoose.Schema({
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false },
  timestamp: { type: Date, default: Date.now },
  ip: String,
  geo: Object,
  userAgent: String,
  sessionId: String,
  actions: [
    {
      type: { type: String },
      label: String,
      mediaId: String,
      url: String,
      timestamp: Date
    }
  ]
});

module.exports = mongoose.model('TapLog', tapLogSchema); 