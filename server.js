require('dotenv').config();
const express = require('express');
const path = require('path');
const applySecurity = require('./src/middleware/security');

const authRoutes = require('./src/routes/authRoutes');
const ownerRoutes = require('./src/routes/ownerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
applySecurity(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/admin', adminRoutes);

// Frontend Catch-all Route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Goat Server Panel running on port ${PORT}`);
});
