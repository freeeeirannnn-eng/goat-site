const User = require('../models/User');
const Config = require('../models/Config');
const Log = require('../models/Log');
const db = require('../config/database');
const bcrypt = require('bcrypt');

class OwnerController {
    static getDashboard(req, res) {
        db.get(`SELECT COUNT(*) as totalAdmins FROM users WHERE role = 'admin'`, (err, adminCount) => {
            db.get(`SELECT COUNT(*) as totalConfigs FROM configs`, (err2, configCount) => {
                db.get(`SELECT COUNT(*) as todayConfigs FROM configs WHERE date(created_date) = date('now')`, (err3, todayCount) => {
                    db.get(`SELECT COUNT(*) as activeAdmins FROM admins WHERE status = 'active'`, (err4, activeCount) => {
                        res.json({
                            totalAdmins: adminCount.totalAdmins,
                            totalConfigs: configCount.totalConfigs,
                            todaysConfigs: todayCount.todayConfigs,
                            activeAdmins: activeCount.activeAdmins
                        });
                    });
                });
            });
        });
    }

    static getAdmins(req, res) {
        User.getAllAdmins((err, admins) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(admins);
        });
    }

    static async createAdmin(req, res) {
        const { username, password, maxGb, maxDays, maxConfigs } = req.body;
        const hashed = await bcrypt.hash(password, 10);

        User.create(username, hashed, 'admin', (err, userId) => {
            if (err) return res.status(400).json({ error: 'Username already exists' });

            const expDate = new Date(Date.now() + maxDays * 86400000).toISOString();
            db.run(`INSERT INTO admins (user_id, max_gb, max_days, max_configs, expiration_date, status) VALUES (?, ?, ?, ?, ?, 'active')`,
                [userId, maxGb, maxDays, maxConfigs, expDate], (err) => {
                    if (err) return res.status(500).json({ error: 'Error creating admin limits' });
                    Log.create(req.user.id, 'CREATE_ADMIN', `Created admin: ${username}`);
                    res.json({ success: true, message: 'Admin created successfully' });
                });
        });
    }

    static toggleAdminStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        User.updateAdminStatus(id, status, (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            Log.create(req.user.id, 'UPDATE_ADMIN_STATUS', `Updated admin ${id} status to ${status}`);
            res.json({ success: true, message: 'Status updated' });
        });
    }

    static getLogs(req, res) {
        Log.getAll((err, logs) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(logs);
        });
    }
}

module.exports = OwnerController;
