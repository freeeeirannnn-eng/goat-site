const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const MONGO_URI = "mongodb+srv://amir012345zarif_db_user:amir1020@cluster0.7cuxkix.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
  volume: { type: Number, default: 0 },
  days: { type: Number, default: 0 },
  reports: { type: Array, default: [] }
});
const Admin = mongoose.model('Admin', adminSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/login-admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username, password });
    if(admin) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch(e) {
    res.status(500).json({ success: false });
  }
});

app.get('/api/admin-reports', async (req, res) => {
  try {
    const { username } = req.query;
    if(username === 'Goathszz') {
      const allAdmins = await Admin.find({});
      let allReports = [];
      allAdmins.forEach(adm => allReports.push(...adm.reports));
      return res.json({ success: true, reports: allReports });
    }

    const admin = await Admin.findOne({ username });
    if(admin) {
      res.json({ success: true, reports: admin.reports });
    } else {
      res.json({ success: true, reports: [] });
    }
  } catch(e) {
    res.status(500).json({ success: false, reports: [] });
  }
});

app.post('/api/create-subscription', async (req, res) => {
  try {
    const { volume, days, panelType, adminName } = req.body;

    const randomNum = Math.floor(100000000 + Math.random() * 900000000);
    const prefix = adminName ? adminName : 'Goat';
    const username = `${prefix}_${randomNum}`;

    let subLink = "";

    if (panelType === 'vip') {
      const panelUrl = "https://sw-r.arazcctv.ir:8000";
      // اصلاح ساختار لینک ساب استاندارد پنل‌های مبتنی بر مارزبان/ربکا
      // معمولاً لینک اشتراک به شکل زیر است (در صورت نیاز به توکن یا لینک مستقیم)
      subLink = `${panelUrl}/sub/${username}`;
      
    } else if (panelType === 'normal') {
      const panelUrl = "https://youpanel.temas-arvha.ir:2053";
      subLink = `${panelUrl}/sub/${username}`;
    }

    const newSub = {
      username,
      volume,
      days,
      panelType,
      subLink,
      date: new Date().toLocaleDateString('fa-IR')
    };

    if(adminName && adminName !== 'Goathszz') {
      await Admin.updateOne(
        { username: adminName },
        { $push: { reports: newSub } }
      );
    }

    res.json({ success: true, username, subLink });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در ارتباط با سرور' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
