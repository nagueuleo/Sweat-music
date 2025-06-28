const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");
const Song = require("./models/Song");
const Album = require("./models/Album");
const Playlist = require("./models/Playlist");
const PlayHistory = require("./models/PlayHistory");
const Like = require("./models/Like");

// Sample data - 10 songs
const sampleSongs = [
  {
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: 200,
    audioUrl: "/songs/1.mp3",
    imageUrl: "/cover-images/1.jpg",
    genre: "Pop",
    playCount: 1500000,
    likes: 45000,
  },
  {
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: 174,
    audioUrl: "/songs/2.mp3",
    imageUrl: "/cover-images/2.jpg",
    genre: "Pop",
    playCount: 1200000,
    likes: 38000,
  },
  {
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: 203,
    audioUrl: "/songs/3.mp3",
    imageUrl: "/cover-images/3.jpg",
    genre: "Pop",
    playCount: 980000,
    likes: 32000,
  },
  {
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    duration: 178,
    audioUrl: "/songs/4.mp3",
    imageUrl: "/cover-images/4.jpg",
    genre: "Pop",
    playCount: 850000,
    likes: 28000,
  },
  {
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    album: "F*CK LOVE 3: OVER YOU",
    duration: 141,
    audioUrl: "/songs/5.mp3",
    imageUrl: "/cover-images/5.jpg",
    genre: "Hip-Hop",
    playCount: 750000,
    likes: 25000,
  },
  {
    title: "Shivers",
    artist: "Ed Sheeran",
    album: "= (Equals)",
    duration: 207,
    audioUrl: "/songs/6.mp3",
    imageUrl: "/cover-images/6.jpg",
    genre: "Pop",
    playCount: 680000,
    likes: 22000,
  },
  {
    title: "Easy On Me",
    artist: "Adele",
    album: "30",
    duration: 225,
    audioUrl: "/songs/7.mp3",
    imageUrl: "/cover-images/7.jpg",
    genre: "Pop",
    playCount: 920000,
    likes: 35000,
  },
  {
    title: "We Don't Talk About Bruno",
    artist: "Carolina Gaitán, Mauro Castillo",
    album: "Encanto (Original Motion Picture Soundtrack)",
    duration: 189,
    audioUrl: "/songs/8.mp3",
    imageUrl: "/cover-images/8.jpg",
    genre: "Other",
    playCount: 1100000,
    likes: 42000,
  },
  {
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    duration: 167,
    audioUrl: "/songs/9.mp3",
    imageUrl: "/cover-images/9.jpg",
    genre: "Pop",
    playCount: 1350000,
    likes: 48000,
  },
  {
    title: "About Damn Time",
    artist: "Lizzo",
    album: "Special",
    duration: 191,
    audioUrl: "/songs/10.mp3",
    imageUrl: "/cover-images/10.jpg",
    genre: "Pop",
    playCount: 720000,
    likes: 24000,
  },
];

// Sample data - 10 albums (using available album images and cover images)
const sampleAlbums = [
  {
    title: "After Hours",
    artist: "The Weeknd",
    genre: "Pop",
    imageUrl: "/albums/1.jpg",
  },
  {
    title: "Fine Line",
    artist: "Harry Styles",
    genre: "Pop",
    imageUrl: "/albums/2.jpg",
  },
  {
    title: "Future Nostalgia",
    artist: "Dua Lipa",
    genre: "Pop",
    imageUrl: "/albums/3.jpg",
  },
  {
    title: "SOUR",
    artist: "Olivia Rodrigo",
    genre: "Pop",
    imageUrl: "/albums/4.jpg",
  },
  {
    title: "F*CK LOVE 3: OVER YOU",
    artist: "The Kid LAROI",
    genre: "Hip-Hop",
    imageUrl: "/cover-images/11.jpg",
  },
  {
    title: "= (Equals)",
    artist: "Ed Sheeran",
    genre: "Pop",
    imageUrl: "/cover-images/12.jpg",
  },
  {
    title: "30",
    artist: "Adele",
    genre: "Pop",
    imageUrl: "/cover-images/13.jpg",
  },
  {
    title: "Encanto (Original Motion Picture Soundtrack)",
    artist: "Various Artists",
    genre: "Other",
    imageUrl: "/cover-images/14.jpg",
  },
  {
    title: "Harry's House",
    artist: "Harry Styles",
    genre: "Pop",
    imageUrl: "/cover-images/15.jpg",
  },
  {
    title: "Special",
    artist: "Lizzo",
    genre: "Pop",
    imageUrl: "/cover-images/16.jpg",
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/spotify-clone"
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Song.deleteMany({});
    await Album.deleteMany({});
    await Playlist.deleteMany({});
    await PlayHistory.deleteMany({});
    await Like.deleteMany({});
    console.log("Cleared existing data");

    // Create admin user
    const adminUser = new User({
      username: process.env.ADMIN_USERNAME || "admin",
      email: process.env.ADMIN_EMAIL || "admin@spotify-clone.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "admin",
    });
    await adminUser.save();
    console.log("Admin user created");

    // Create 2 sample users
    const sampleUsers = [
      {
        username: "john_doe",
        email: "john@example.com",
        password: "password123",
      },
      {
        username: "jane_smith",
        email: "jane@example.com",
        password: "password123",
      },
    ];

    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log("2 Sample users created");

    // Create 10 sample songs
    const createdSongs = [];
    for (const songData of sampleSongs) {
      const song = new Song(songData);
      await song.save();
      createdSongs.push(song);
    }
    console.log("10 Sample songs created");

    // Create 10 sample albums with songs
    const createdAlbums = [];
    for (let i = 0; i < sampleAlbums.length; i++) {
      const albumData = sampleAlbums[i];
      const album = new Album({
        ...albumData,
        songs: [createdSongs[i]._id], // Assign one song per album
      });
      await album.save();
      createdAlbums.push(album);
    }
    console.log("10 Sample albums created");

    // Create 5 likes for each user (10 likes total)
    for (const user of createdUsers) {
      // Select 5 random songs for each user
      const randomSongs = createdSongs
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

      for (const song of randomSongs) {
        const like = new Like({
          userId: user._id,
          songId: song._id,
        });
        await like.save();
      }
    }
    console.log("5 likes created for each user (10 total)");

    // Create 1 playlist for the first user
    const playlist = new Playlist({
      name: "My Favorite Songs",
      description: "A collection of my favorite tracks",
      imageUrl: "/cover-images/17.jpg",
      owner: createdUsers[0]._id,
      songs: createdSongs.slice(0, 5).map((song) => song._id), // First 5 songs
      isPublic: true,
      followers: [createdUsers[1]._id], // Second user follows this playlist
    });
    await playlist.save();
    console.log("1 Playlist created");

    // Create 1 play history entry for the first user
    const playHistory = new PlayHistory({
      userId: createdUsers[0]._id,
      songId: createdSongs[0]._id,
      playedAt: new Date(),
    });
    await playHistory.save();
    console.log("1 Play history entry created");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\nAdmin credentials:");
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || "admin123"}`);
    console.log("\nSample user credentials:");
    console.log("Email: john@example.com, Password: password123");
    console.log("Email: jane@example.com, Password: password123");
    console.log("\n📊 Summary:");
    console.log("- 10 songs created");
    console.log("- 10 albums created");
    console.log("- 2 users created (plus admin)");
    console.log("- 5 likes per user (10 total)");
    console.log("- 1 playlist created");
    console.log("- 1 play history entry created");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
