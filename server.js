const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// سرو کردن فایل‌های استاتیک فرانت‌اند
app.use(express.static(path.join(__dirname, 'public')));

// روت صریح برای هدایت به index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/goodserver_panel';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('DB Connection Error:', err));

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

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'Goathszz' && password === 'admin12345') {
        return res.json({ user: { username: 'Goathszz', role: 'super_admin' } });
    }
    if (username === 'admin' && password === '1234') {
        return res.json({ user: { username: 'گود-ادمین', role: 'sub_admin' } });
    }
    res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
});

app.post('/api/subscriptions', async (req, res) => {
    try {
        const { adminName, panelType, traffic, days } = req.body;
        const randomUsername = `Good_${Math.floor(100000 + Math.random() * 900000)}`;
        const subLink = `https://sub.rebeka-node.com/sub/${randomUsername}`;

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

app.get('/api/subscriptions', async (req, res) => {
    const { admin } = req.query;
    const query = admin ? { adminName: admin } : {};
    const subs = await Subscription.find(query).sort({ createdAt: -1 });
    res.json(subs);
});

app.get('/api/all-subscriptions', async (req, res) => {
    const allSubs = await Subscription.find().sort({ createdAt: -1 });
    res.json(allSubs);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
