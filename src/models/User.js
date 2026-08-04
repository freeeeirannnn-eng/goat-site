const db = require('../config/database');

class User {
    static findByUsername(username, callback) {
        db.get(`SELECT * FROM users WHERE username = ?`, [username], callback);
    }

    static findById(id, callback) {
        db.get(`SELECT * FROM users WHERE id = ?`, [id], callback);
    }

    static create(username, password, role, callback) {
        db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, password, role], function(err) {
            callback(err, this ? this.lastID : null);
        });
    }

    static getAllAdmins(callback) {
        db.all(`SELECT u.id, u.username, a.max_gb, a.max_days, a.max_configs, a.expiration_date, a.status 
                FROM users u JOIN admins a ON u.id = a.user_id WHERE u.role = 'admin'`, callback);
    }

    static updateAdminStatus(userId, status, callback) {
        db.run(`UPDATE admins SET status = ? WHERE user_id = ?`, [status, userId], callback);
    }

    static updatePassword(userId, newPassword, callback) {
        db.run(`UPDATE users SET password = ? WHERE id = ?`, [newPassword, userId], callback);
    }
}

module.exports = User;
