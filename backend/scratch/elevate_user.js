const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function elevate() {
  try {
    const emailToFind = 'misheckchampopa01';
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find by exact email or prefix
    const user = await User.findOne({ 
      $or: [
        { email: emailToFind },
        { email: new RegExp('^' + emailToFind, 'i') }
      ]
    });

    if (!user) {
      console.log('❌ User not found with email matching:', emailToFind);
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`✅ Success: ${user.email} is now an ADMIN`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

elevate();
