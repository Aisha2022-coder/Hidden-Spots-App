const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

process.on('uncaughtException', (err, origin) => {
  console.error(`❌ UNCAUGHT EXCEPTION: ${err.stack || err}`);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error(`❌ UNHANDLED REJECTION: ${reason}`);
});

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.use('/api/spots', require('./routes/spots'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 });
    console.log('✅ MongoDB Connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();

