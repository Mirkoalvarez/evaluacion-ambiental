// backend/middlewares/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

function auth(req, res, next) {
    if (req.method === 'OPTIONS') return next(); // permitir preflight CORS
    const header = req.headers.authorization || req.headers.Authorization || '';
    const parts = header.split(' ');
    const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null;

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    try {
        req.user = jwt.verify(token, config.jwtSecret);
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Token invalido' });
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Token requerido' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'No autorizado' });
        }
        return next();
    };
}

module.exports = { auth, authorize };
