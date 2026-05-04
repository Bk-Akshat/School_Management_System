const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set. Add it to your backend environment variables.");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB Atlas.");
}

module.exports = connectDB;
