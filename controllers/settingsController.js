const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

// In-memory settings store (replace with database in production)
let settings = {
    siteName: 'NFC Business Card System',
    defaultTheme: 'light',
    apiKey: crypto.randomBytes(32).toString('hex')
};

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private (super_admin)
const getSettings = asyncHandler(async (req, res) => {
    res.json(settings);
});

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private (super_admin)
const updateSettings = asyncHandler(async (req, res) => {
    const { siteName, defaultTheme } = req.body;

    if (siteName) settings.siteName = siteName;
    if (defaultTheme) settings.defaultTheme = defaultTheme;

    res.json(settings);
});

// @desc    Regenerate API key
// @route   POST /api/admin/settings/api-key
// @access  Private (super_admin)
const regenerateApiKey = asyncHandler(async (req, res) => {
    settings.apiKey = crypto.randomBytes(32).toString('hex');
    res.json({ apiKey: settings.apiKey });
});

module.exports = {
    getSettings,
    updateSettings,
    regenerateApiKey
}; 