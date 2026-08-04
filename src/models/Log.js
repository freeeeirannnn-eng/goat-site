const db = require('../config/database');

class Log {
    static create(userId, action, details, callback) {
        const timestamp = new Date().toISOString();
        db.run(`INSERT INTO logs (user_id, action, details, timestamp) VALUES (?, ?, ?, ?)`,
            [userId, action, details, timestamp], callback);
    }

    static getAll(callback) {
        db.all(`SELECT logs.*, users.username FROM logs LEFT JOIN users ON logs.user_id = users.id ORDER BY timestamp DESC`, callback);
    }
}

module.exports = Log;
