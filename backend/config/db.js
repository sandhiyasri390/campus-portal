const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let globalMongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_placement';

  // 1. Attempt configured MONGO_URI (e.g. Atlas or existing local)
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log('[db] MongoDB connected to', mongoose.connection.host);
    return;
  } catch (err) {
    console.warn(`[db] Primary connection failed: ${err.message}`);
  }

  // 2. If configured URI was Atlas or remote, try standard localhost
  if (!uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/campus_placement', { serverSelectionTimeoutMS: 1500 });
      console.log('[db] Connected to local MongoDB on 127.0.0.1:27017');
      return;
    } catch (e) {
      // Local 27017 not running yet
    }
  }

  // 3. Fallback: Launch persistent embedded MongoDB instance
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dbPath = path.join(__dirname, '..', '.db_data');
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

    try {
      globalMongod = await MongoMemoryServer.create({
        instance: { port: 27017, dbPath, storageEngine: 'wiredTiger' },
      });
    } catch (portErr) {
      globalMongod = await MongoMemoryServer.create({
        instance: { dbPath, storageEngine: 'wiredTiger' },
      });
    }

    const fallbackUri = `${globalMongod.getUri().replace(/\/$/, '')}/campus_placement`;
    await mongoose.connect(fallbackUri);
    console.log('[db] Connected to persistent local MongoDB at', fallbackUri);
  } catch (embeddedErr) {
    console.error('[db] All MongoDB connection attempts failed:', embeddedErr.message);
    process.exit(1);
  }
};

module.exports = connectDB;

