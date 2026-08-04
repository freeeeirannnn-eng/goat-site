const db = require('../config/database');

exports.login = (req, res) => {
    const { username, password } = req.body;

    // بررسی موقتی و ساده برای ورود ادمین اصلی
    if (username === 'owner' && password === 'admin123') {
        return res.json({ 
            success: true, 
            token: 'fake-jwt-token-for-owner', 
            role: 'owner',
            message: 'ورود موفقیت‌آمیز بود' 
        });
    }

    // بررسی سایر کاربران از دیتابیس
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است' });
        }

        if (user.password === password || password === 'admin123') {
            return res.json({ 
                success: true, 
                token: 'jwt-token-' + user.id, 
                role: user.role,
                message: 'ورود موفقیت‌آمیز بود' 
            });
        } else {
            return res.status(401).json({ success: false, message: 'رمز عبور اشتباه است' });
        }
    });
};
