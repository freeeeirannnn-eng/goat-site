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

// لاگین ادمین‌های فرعی
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

app.get('/api/admins', async (req, res) => {
  try {
    const admins = await Admin.find({});
    res.json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post('/api/admins/add', async (req, res) => {
  try {
    const { username, password, volume, days } = req.body;
    await Admin.create({ username, password, volume, days, reports: [] });
    res.json({ success: true, message: 'ادمین اضافه شد.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطا' });
  }
});

app.post('/api/admins/delete', async (req, res) => {
  try {
    const { username } = req.body;
    await Admin.deleteOne({ username });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post('/api/admins/settle', async (req, res) => {
  try {
    const { username } = req.body;
    await Admin.updateOne({ username }, { $set: { reports: [] } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ساخت خودکار نام کاربری و ارتباط با پنل مقصد
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { volume, days, panelType, adminName } = req.body;

    // تولید نام کاربری بر اساس اسم ادمین + عدد رندوم (مثل Nika_1785862421)
    const randomNum = Math.floor(100000000 + Math.random() * 900000000);
    const prefix = adminName ? adminName : 'Goat';
    const username = `${prefix}_${randomNum}`;

    let subLink = "";

    if (panelType === 'vip') {
      const panelUrl = "https://sw-r.arazcctv.ir:8000";
      const apiKey = "rk_0nx9a08Sq9Q2WpHyL3uXtoORel_A8jJXUpg8vRc-IgE";
      
      // نمونه ارسال به پنل ربکا (در صورت داشتن مسیر دقیق API پَنل، جایگزین می‌شود)
      /*
      await axios.post(`${panelUrl}/api/v1/user/add`, {
        username: username,
        data_limit: volume,
        expire_days: days
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      */
     subLink = `${panelUrl}/sub/${username}`;

    } else if (panelType === 'normal') {
      const panelUrl = "https://youpanel.temas-arvha.ir:2053";
      subLink = `${panelUrl}/sub/${username}`;
    }

    // ذخیره گزارش در دیتابیس برای ادمین مربوطه
    if(adminName && adminName !== 'Goathszz') {
      await Admin.updateOne(
        { username: adminName },
        { $push: { reports: { username, volume, days, panelType, date: new Date().toLocaleString('fa-IR') } } }
      );
    }

    res.json({ 
      success: true, 
      username: username,
      subLink: subLink,
      message: `اشتراک با موفقیت ساخته شد!` 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در ارتباط با سرور پنل مقصد' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
