import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';
import { UserRole } from './src/types';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URL || '');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      email: 'admin@example.com',
      password: 'admin123456', // Will be hashed automatically
      name: 'Super Admin',
      role: UserRole.ADMIN,
      isVerified: true // Admin is auto-verified
    });

    await admin.save();

    console.log('✅ Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123456');
    console.log('Role:', admin.role);
    console.log('');
    console.log('🔐 Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
