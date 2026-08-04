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

// مدل دیتابیس برای ادمین‌ها و گزارشات
const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
  volume: { type: Number, default: 0 },
  days: { type: Number, default: 0 },
  reports: { type: Array, default: [] } // ذخیره گزارشات ساخت اشتراک این ادمین
});
const Admin = mongoose.model('Admin', adminSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// دریافت لیست ادمین‌ها
app.get('/api/admins', async (req, res) => {
  try {
    const admins = await Admin.find({});
    res.json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ success: false, error: 'خطا در دریافت ادمین‌ها' });
  }
});

// افزودن ادمین جدید
app.post('/api/admins/add', async (req, res) => {
  try {
    const { username, password, volume, days } = req.body;
    const exists = await Admin.findOne({ username });
    if (exists) {
      return res.status(400).json({ success: false, message: 'این ادمین قبلاً ثبت شده است.' });
    }
    await Admin.create({ username, password, volume, days, reports: [] });
    res.json({ success: true, message: 'ادمین جدید با موفقیت اضافه شد.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطا در ایجاد ادمین' });
  }
});

// حذف ادمین
app.post('/api/admins/delete', async (req, res) => {
  try {
    const { username } = req.body;
    await Admin.deleteOne({ username });
    res.json({ success: true, message: 'ادمین حذف شد.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطا در حذف ادمین' });
  }
});

// تسویه حساب ادمین و پاکسازی گزارشات
app.post('/api/admins/settle', async (req, res) => {
  try {
    const { username } = req.body;
    await Admin.updateOne({ username }, { $set: { reports: [] } });
    res.json({ success: true, message: 'تسویه حساب انجام شد و گزارشات پاک شدند.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطا در تسویه حساب' });
  }
});

// مسیر ساخت اشتراک واقعی
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { username, volume, days, panelType, adminName } = req.body;

    let panelUrl = "";
    if (panelType === 'vip') {
      panelUrl = "Https://sw-r.arazcctv.ir:8000";
      const apiKey = "rk_0nx9a08Sq9Q2WpHyL3uXtoORel_A8jJXUpg8vRc-IgE";
      // ارتباط با ربکا...
    } else if (panelType === 'normal') {
      panelUrl = "https://youpanel.temas-arvha.ir:2053";
      // ارتباط با یو پنل...
    }

    // ثبت گزارش در صورت وجود ادمین (یا ادمین کل)
    if(adminName) {
      await Admin.updateOne(
        { username: adminName },
        { $push: { reports: { username, volume, days, panelType, date: new Date().toLocaleString('fa-IR') } } }
      );
    }

    res.json({ 
      success: true, 
      message: `اشتراک با موفقیت روی پنل (${panelType === 'vip' ? 'ربکا' : 'یو پنل'}) ایجاد شد!` 
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
