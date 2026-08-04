const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fetch = require('node-fetch'); // یا استفاده از fetch پیش‌فرض نود
const app = express();

app.use(express.json());
app.use(express.static('public'));

// اتصال به MongoDB
mongoose.connect('mongodb://localhost:27017/goodserver_panel', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'));

// مدل دیتابیس برای ذخیره اشتراک‌ها
const SubscriptionSchema = new mongoose.Schema({
    adminName: String,
    username: String,
    panelType: String,
    traffic: Number,
    days: Number,
    subLink: String,
    createdAt: { type: Date, default: Date.now }
});
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

// تنظیمات اتصال به پنل ربکا (لطفاً در صورت نیاز آدرس دقیق و API Key را وارد کنید)
const REBEKA_API_URL = "https://your-rebeka-panel.com/api"; 
const REBEKA_API_KEY = "your_rebeka_api_key_here";

// سیستم احراز هویت ساده برای مدیر کل و ادمین‌های گود سرور
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // بررسی ادمین کل
    if (username === 'Goathszz' && password === 'admin12345') {
        return res.json({ user: { username: 'Goathszz', role: 'super_admin' } });
    }

    // ادمین‌های عادی گود سرور (می‌توانید در دیتابیس هم ذخیره کنید)
    if (username === 'admin' && password === '1234') {
        return res.json({ user: { username: 'گود-ادمین', role: 'sub_admin' } });
    }

    res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
});

// ایجاد اشتراک جدید و ارتباط با پنل ربکا
app.post('/api/subscriptions', async (req, res) => {
    try {
        const { adminName, panelType, traffic, days } = req.body;
        const randomUsername = `Good_${Math.floor(100000 + Math.random() * 900000)}`;

        let subLink = `https://sub.rebeka-node.com/sub/${randomUsername}`; // لینک پیش‌فرض نمونه

        // اگر مایل به اتصال واقعی به API پنل ربکا هستید:
        /*
        const rebekaRes = await fetch(`${REBEKA_API_URL}/user/create`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${REBEKA_API_KEY}`
            },
            body: JSON.stringify({ username: randomUsername, traffic: traffic * 1024 * 1024 * 1024, days })
        });
        const rebekaData = await rebekaRes.json();
        subLink = rebekaData.subLink;
        */

        const newSub = new Subscription({
            adminName,
            username: randomUsername,
            panelType,
            traffic,
            days,
            subLink
        });

        await newSub.save();
        res.status(201).json(newSub);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// دریافت اشتراک‌های یک ادمین خاص
app.get('/api/subscriptions', async (req, res) => {
    const { admin } = req.query;
    const query = admin ? { adminName: admin } : {};
    const subs = await Subscription.find(query).sort({ createdAt: -1 });
    res.json(subs);
});

// گزارش کامل کل سیستم (مخصوص مدیر کل Goathszz)
app.get('/api/all-subscriptions', async (req, res) => {
    const allSubs = await Subscription.find().sort({ createdAt: -1 });
    res.json(allSubs);
});

app.listen(3000, () => console.log('Server running on port 3000'));
