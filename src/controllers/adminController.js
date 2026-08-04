const Config = require('../models/Config');
const Log = require('../models/Log');
const RebeccaApi = require('../utils/rebeccaApi');
const db = require('../config/database');

class AdminController {
    static getDashboard(req, res) {
        const adminId = req.user.id;
        Config.countByAdmin(adminId, (err, countRow) => {
            db.all(`SELECT volume, used_traffic FROM configs WHERE admin_id = ?`, [adminId], (err2, rows) => {
                let totalVolume = 0;
                let usedTraffic = 0;
                if (rows) {
                    rows.forEach(r => {
                        totalVolume += r.volume;
                        usedTraffic += r.used_traffic;
                    });
                }
                res.json({
                    configsCreated: countRow ? countRow.count : 0,
                    trafficUsed: usedTraffic.toFixed(2),
                    remainingGb: Math.max(0, (totalVolume - usedTraffic)).toFixed(2),
                    remainingDays: 30
                });
            });
        });
    }

    static getConfigs(req, res) {
        Config.findByAdminId(req.user.id, (err, configs) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(configs);
        });
    }

    static async createConfig(req, res) {
        const { username, volume, days, remark } = req.body;
        if (!username || !volume || !days) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        try {
            const apiResponse = await RebeccaApi.createConfig(username, volume, days);
            const createdDate = new Date().toISOString();

            Config.create({
                adminId: req.user.id,
                username,
                uuid: apiResponse.uuid,
                volume,
                expireDate: apiResponse.expire_date,
                createdDate,
                subscriptionUrl: apiResponse.subscription_url
            }, (err) => {
                if (err) return res.status(400).json({ error: 'Config username already exists' });
                Log.create(req.user.id, 'CREATE_CONFIG', `Created config for user: ${username}`);
                res.json({ success: true, message: 'Config created successfully', data: apiResponse });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AdminController;
