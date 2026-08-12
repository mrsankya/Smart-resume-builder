// ============================================
// seedAdmin.js - Ensure Admin Account Exists
// ============================================

import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';

export const seedAdminUser = async () => {
  try {
    const adminEmail = 'sanketbhende0@gmail.com';
    const adminPass = 'sankyaadmin';
    const adminName = 'Sanket Bhende';

    let admin = await User.findOne({ email: adminEmail });

    const hashedPassword = await bcrypt.hash(adminPass, 10);

    if (admin) {
      admin.role = 'admin';
      admin.name = adminName;
      admin.password = hashedPassword;
      await admin.save();
      console.log(`[Admin Seed] Admin account verified & updated: ${adminEmail}`);
    } else {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`[Admin Seed] Admin account created: ${adminEmail}`);
    }
  } catch (error) {
    console.error('[Admin Seed Error]:', error.message);
  }
};

export default seedAdminUser;
