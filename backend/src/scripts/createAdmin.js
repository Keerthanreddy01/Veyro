require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const adminEmail = process.env.ADMIN_EMAIL || 'admin@veyro.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
const adminName = process.env.ADMIN_NAME || 'System Administrator';

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is missing from .env');
      process.exit(1);
    }

    console.log('⏳ Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log(`ℹ️ Admin user with email "${adminEmail}" already exists with role "admin".`);
      } else {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`✅ Existing user "${adminEmail}" upgraded to role "admin".`);
      }
    } else {
      // The pre('save') hook in User model automatically hashes the password using bcrypt with salt rounds = 12
      const newAdmin = new User({
        name: adminName,
        email: adminEmail,
        passwordHash: adminPassword,
        role: 'admin',
        isActive: true,
      });

      await newAdmin.save();
      console.log(`\n🎉 Admin user created successfully!`);
      console.log(`   Email:    ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role:     admin\n`);
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

createAdmin();
