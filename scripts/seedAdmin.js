const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const adminEmail = 'admin@nfc.com';
  const adminData = {
    firstName: 'System',
    lastName: 'Administrator',
    email: adminEmail,
    phone: '0912345678', // Use a valid 10-digit number if your schema requires it
    password: 'Admin@123', // Change this after first login!
    role: 'admin',
    isVerified: true,
  };

  // Check if admin already exists
  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit();
  }

  await User.create(adminData);
  console.log('Admin user created successfully!');
  process.exit();
}

seedAdmin().catch(err => {
  console.error(err);
  process.exit(1);
}); 