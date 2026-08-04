const db = require('../config/database');

class Log {
    static create(userId, action, details, callback) {
        const timestamp = new Date().toISOString();
        db.run(`INSERT INTO logs (user_id, action, details, timestamp) VALUES (?, ?, ?, ?)`, 
                [userId, action, details, timestamp], callback);
    }

    static getAll(callback) {
        db.all(`SELECT l.*, u.username FROM logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.id DESC LIMIT 100`, callback);
    }
}

module.exports = Log;
