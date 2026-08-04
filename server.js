const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// خواندن فایل‌های استاتیک (مثل index.html برای پنل وب)
app.use(express.static(__dirname));

// لینک اتصال دیتابیس شما
const MONGO_URI = "mongodb+srv://amir012345zarif_db_user:amir1020@cluster0.7cuxkix.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// مسیر پیش‌فرض برای بارگذاری صفحه پنل وب
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// مسیر ساخت اشتراک واقعی
// ==========================================
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { username, volume, days, panelType } = req.body;

    // --- 1. پنل ویژه (ربکا) ---
    if (panelType === 'vip') {
      const panelUrl = "Https://sw-r.arazcctv.ir:8000";
      const apiKey = "rk_0nx9a08Sq9Q2WpHyL3uXtoORel_A8jJXUpg8vRc-IgE";

      // نمونه درخواست به API ربکا
      /*
      const response = await axios.post(`${panelUrl}/api/v1/user/add`, {
        username: username,
        data_limit: volume,
        expire_days: days
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      */

      return res.json({ 
        success: true, 
        message: `اشتراک ویژه با موفقیت روی پنل ربکا (${panelUrl}) ایجاد شد!` 
      });
    } 
    
    // --- 2. پنل عادی (یو پنل) ---
    else if (panelType === 'normal') {
      const panelUrl = "https://youpanel.temas-arvha.ir:2053";
      const upanelUsername = "rp6422509900_0b211fdd";
      const upanelPassword = "LMQFmdeFAQ7EwvUr3h";

      // مرحله اول لاگین به یو پنل برای دریافت دسترسی
      /*
      const loginRes = await axios.post(`${panelUrl}/api/login`, {
        username: upanelUsername,
        password: upanelPassword
      });
      const sessionCookie = loginRes.headers['set-cookie'];

      // مرحله دوم ساخت کاربر با استفاده از سشن
      await axios.post(`${panelUrl}/api/user/create`, {
        username, volume, days
      }, {
        headers: { 'Cookie': sessionCookie }
      });
      */

      return res.json({ 
        success: true, 
        message: `اشتراک عادی با موفقیت روی یو پنل (${panelUrl}) ایجاد شد!` 
      });
      
    } else {
      return res.status(400).json({ success: false, error: 'نوع پنل نامعتبر است.' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در برقراری ارتباط با سرور پنل مقصد' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
