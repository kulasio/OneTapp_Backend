const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  plan: { type: String, required: true },
  billingPeriod: { type: String, required: true },
  status: { type: String, default: 'pending' }, // pending, success, failed, cancelled
  requestReferenceNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', subscriptionSchema); 