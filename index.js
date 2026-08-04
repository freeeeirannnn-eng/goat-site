const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./src/config/database');
const applySecurity = require('./src/middleware/security');
const authRoutes = require('./src/routes/authRoutes');
const ownerRoutes = require('./src/routes/ownerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Apply security middleware & parsers
applySecurity(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/admin', adminRoutes);

// Fallback to frontend index.html for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auto-create default owner account on startup if not exists
db.get(`SELECT * FROM users WHERE username = 'owner'`, (err, row) => {
    if (!row) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT INTO users (username, password, role, max_gb, max_configs, status) VALUES (?, ?, ?, ?, ?, ?)`,
            ['owner', hashedPassword, 'owner', 1000, 1000, 'active'],
            (err) => {
                if (err) console.log('Error creating default owner:', err.message);
                else console.log('Default owner (owner / admin123) created automatically.');
            }
        );
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
