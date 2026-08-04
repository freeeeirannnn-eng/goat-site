const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

function applySecurity(app) {
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors());
    app.use(limiter);
}

module.exports = applySecurity;
