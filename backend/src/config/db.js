const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!connUri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true
    });

    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
