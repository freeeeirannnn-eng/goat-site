const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Log = require('../models/Log');

class AuthController {
    static login(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        User.findByUsername(username, async (err, user) => {
            if (err || !user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                Log.create(user.id, 'LOGIN_FAILED', 'Incorrect password attempt');
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production',
                { expiresIn: '24h' }
            );

            Log.create(user.id, 'LOGIN_SUCCESS', 'User logged in successfully');
            res.json({ success: true, token, role: user.role });
        });
    }

    static changePassword(req, res) {
        const { currentPassword, newPassword } = req.body;
        User.findById(req.user.id, async (err, user) => {
            if (err || !user) return res.status(404).json({ error: 'User not found' });

            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) return res.status(400).json({ error: 'Current password is incorrect' });

            const hashed = await bcrypt.hash(newPassword, 10);
            User.updatePassword(user.id, hashed, (err) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                Log.create(user.id, 'CHANGE_PASSWORD', 'User updated password');
                res.json({ success: true, message: 'Password updated successfully' });
            });
        });
    }
}

module.exports = AuthController;
