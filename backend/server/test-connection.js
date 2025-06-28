const mongoose = require("mongoose");
require("dotenv").config();

async function testConnection() {
  try {
    console.log("Testing MongoDB connection...");
    console.log(
      "MONGODB_URI:",
      process.env.MONGODB_URI || "mongodb://localhost:27017/spotify-clone"
    );

    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/spotify-clone",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("✅ MongoDB connection successful!");

    // Test basic operations
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "Collections in database:",
      collections.map((c) => c.name)
    );

    await mongoose.connection.close();
    console.log("Connection closed successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("Full error:", error);
  }
}

testConnection();
