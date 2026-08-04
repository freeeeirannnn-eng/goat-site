const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin'
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            max_gb REAL DEFAULT 100,
            max_days INTEGER DEFAULT 30,
            max_configs INTEGER DEFAULT 10,
            expiration_date TEXT,
            status TEXT DEFAULT 'active',
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER,
            username TEXT UNIQUE NOT NULL,
            uuid TEXT NOT NULL,
            volume REAL NOT NULL,
            used_traffic REAL DEFAULT 0,
            expire_date TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_date TEXT NOT NULL,
            subscription_url TEXT,
            FOREIGN KEY(admin_id) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            timestamp TEXT NOT NULL
        )`);

        // Seed default Owner account if not exists
        db.get(`SELECT * FROM users WHERE username = 'owner'`, async (err, row) => {
            if (!row) {
                const hashedPassword = await bcrypt.hash('owner123', 10);
                db.run(`INSERT INTO users (username, password, role) VALUES ('owner', ?, 'owner')`, [hashedPassword], function(err) {
                    if (!err) {
                        const ownerId = this.lastID;
                        db.run(`INSERT INTO admins (user_id, max_gb, max_days, max_configs, status) VALUES (?, 9999, 365, 999, 'active')`, [ownerId]);
                    }
                });
            }
        });
    });
}

module.exports = db;
