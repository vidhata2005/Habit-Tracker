const mongoose = require('mongoose');

// Create a schema for user profile
const userProfileSchema = new mongoose.Schema({
  username: { type: String, required: true },
  fullName: String,
  dob: String,
  passion: String,
  email: String,
  phone: String,
  profilePic: String
});

// Export model
module.exports = mongoose.model('UserProfile', userProfileSchema);
