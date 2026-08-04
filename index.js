const express = require('express');
const path = require('path');
require('dotenv').config();

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
