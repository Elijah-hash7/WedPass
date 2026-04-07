
import mongoose from 'mongoose';

const uri = "mongodb+srv://elijah347:elijah347-1@cluster0.wxvyeei.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // We don't need the full schema, just enough to query
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      verificationOtp: String,
      otpExpiresAt: Date,
      isVerified: Boolean
    }));

    const user = await User.findOne({ email: "emmanuelelijah347@gmail.com" });
    if (user) {
      console.log('--- USER DATA ---');
      console.log('Email:', user.email);
      console.log('OTP:', user.verificationOtp);
      console.log('OTP Expires At:', user.otpExpiresAt);
      console.log('Is Verified:', user.isVerified);
      console.log('------------------');
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
