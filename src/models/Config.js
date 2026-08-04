const db = require('../config/database');

class Config {
    static create(data, callback) {
        const { adminId, username, uuid, volume, expireDate, createdDate, subscriptionUrl } = data;
        db.run(`INSERT INTO configs (admin_id, username, uuid, volume, expire_date, created_date, subscription_url) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [adminId, username, uuid, volume, expireDate, createdDate, subscriptionUrl], callback);
    }

    static findByAdminId(adminId, callback) {
        db.all(`SELECT * FROM configs WHERE admin_id = ?`, [adminId], callback);
    }

    static findAll(callback) {
        db.all(`SELECT * FROM configs`, callback);
    }

    static countByAdmin(adminId, callback) {
        db.get(`SELECT COUNT(*) as count FROM configs WHERE admin_id = ?`, [adminId], callback);
    }
}

module.exports = Config;
