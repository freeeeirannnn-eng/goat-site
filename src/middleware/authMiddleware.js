const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

function verifyOwner(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: 'Owner access required' });
        }
        next();
    });
}

module.exports = { verifyToken, verifyOwner };
