const TapLog = require('../models/tapLogModel');

exports.logTap = async (req, res) => {
  try {
    const tap = await TapLog.create(req.body);
    res.status(201).json(tap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logUserAction = async (req, res) => {
  try {
    // For now, create a new TapLog for each user action
    const actionLog = await TapLog.create(req.body);
    res.status(201).json(actionLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 