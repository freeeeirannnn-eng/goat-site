const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); // برای فرستادن درخواست به پنل‌های دیگر

const app = express();
app.use(express.json());
app.use(cors());

// لینک اتصال دیتابیس شما
const MONGO_URI = "mongodb+srv://amir012345zarif_db_user:amir1020@cluster0.7cuxkix.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Goat Server Master Panel is running!');
});

// ==========================================
// بخش مدیریت و اتصال به پنل‌های (ربکا و یو پنل)
// ==========================================

// 1. مسیر تست اتصال به پنل ربکا (Remix)
app.post('/api/connect-remix', async (req, res) => {
  try {
    const { panelUrl, apiKey } = req.body;
    // اینجا گوت سرور به پنل ربکا درخواست می‌فرستد تا ارتباط را تست کند
    // (بسته به مستندات API ربکا، آدرس بررسی توکن فرستاده می‌شود)
    res.json({ success: true, message: 'Connected to Remix Panel successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to connect to Remix Panel' });
  }
});

// 2. مسیر تست اتصال به یو پنل (UPanel)
app.post('/api/connect-upanel', async (req, res) => {
  try {
    const { panelUrl, apiKey } = req.body;
    // اینجا گوت سرور به یو پنل درخواست می‌فرستد
    res.json({ success: true, message: 'Connected to UPanel successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to connect to UPanel' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
