// backend/controllers/userController.js
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/config');

const ROLES_PERMITIDOS = ['admin', 'moderador', 'user'];

const userController = {
    // POST /api/auth/register
    async register(req, res, next) {
        try {
            let { username, email, password, role } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'username, email y password son obligatorios' });
            }

            username = String(username).trim();
            email = String(email).trim().toLowerCase();
            password = String(password);

            if (!username || !email || !password.trim()) {
                return res.status(400).json({ error: 'Los campos no pueden estar vacíos' });
            }

            if (!/\S+@\S+\.\S+/.test(email)) {
                return res.status(400).json({ error: 'Email con formato inválido' });
            }

            if (role && !ROLES_PERMITIDOS.includes(role)) {
                return res.status(400).json({ error: `Rol inválido. Usa uno de: ${ROLES_PERMITIDOS.join(', ')}` });
            }

            const existente = await User.findOne({
                where: { [Op.or]: [{ username }, { email }] }
            });

            if (existente) {
                return res.status(409).json({ error: 'Ya existe un usuario con ese username o email' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                username,
                email,
                password: hashedPassword,
                role: role && ROLES_PERMITIDOS.includes(role) ? role : 'user',
            });

            const token = jwt.sign(
                { id: user.id, role: user.role },
                config.jwtSecret,
                { expiresIn: '2h' }
            );

            const sanitizedUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.createdAt,
            };

            return res.status(201).json({ user: sanitizedUser, token });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/auth/login
    async login(req, res, next) {
        try {
            const { username, email, password } = req.body || {};

            if (!password || (!username && !email)) {
                return res.status(400).json({ error: 'Debes enviar username o email y password' });
            }

            const where = username
                ? { username: String(username).trim() }
                : { email: String(email).trim().toLowerCase() };

            const user = await User.findOne({ where });
            if (!user) {
                return res.status(401).json({ error: 'Credenciales invalidas' });
            }

            const ok = await bcrypt.compare(String(password), user.password);
            if (!ok) {
                return res.status(401).json({ error: 'Credenciales invalidas' });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role },
                config.jwtSecret,
                { expiresIn: '2h' }
            );

            const sanitizedUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.createdAt,
            };

            return res.json({ user: sanitizedUser, token });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/auth/users
    async getUsers(req, res, next) {
        try {
            const users = await User.findAll({
                attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
                order: [['createdAt', 'DESC']],
            });
            res.json(users);
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/auth/users/:id
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const userId = Number(id);
            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(400).json({ error: 'ID invalido' });
            }

            const { username, email, role, password } = req.body || {};
            if (
                typeof username === 'undefined' &&
                typeof email === 'undefined' &&
                typeof role === 'undefined' &&
                typeof password === 'undefined'
            ) {
                return res.status(400).json({ error: 'Nada para actualizar' });
            }

            if (role && !ROLES_PERMITIDOS.includes(role)) {
                return res.status(400).json({ error: `Rol invalido. Usa uno de: ${ROLES_PERMITIDOS.join(', ')}` });
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Validar duplicados si se cambia username/email
            if (typeof username !== 'undefined') {
                const nuevoUsername = String(username).trim();
                if (!nuevoUsername) return res.status(400).json({ error: 'username no puede estar vacio' });
                const conflict = await User.findOne({
                    where: { username: nuevoUsername, id: { [Op.ne]: userId } }
                });
                if (conflict) return res.status(409).json({ error: 'Ya existe un usuario con ese username' });
                user.username = nuevoUsername;
            }

            if (typeof email !== 'undefined') {
                const nuevoEmail = String(email).trim().toLowerCase();
                if (!/\S+@\S+\.\S+/.test(nuevoEmail)) {
                    return res.status(400).json({ error: 'Email con formato invalido' });
                }
                const conflictEmail = await User.findOne({
                    where: { email: nuevoEmail, id: { [Op.ne]: userId } }
                });
                if (conflictEmail) return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
                user.email = nuevoEmail;
            }

            if (typeof role !== 'undefined') {
                user.role = role;
            }

            if (typeof password !== 'undefined') {
                const pwd = String(password);
                if (!pwd.trim()) {
                    return res.status(400).json({ error: 'La contraseña no puede estar vacía' });
                }
                const hashed = await bcrypt.hash(pwd, 10);
                user.password = hashed;
            }

            await user.save(); // updatedAt se actualiza automaticamente

            const sanitizedUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.createdAt,
                updated_at: user.updatedAt,
            };

            return res.json({ user: sanitizedUser });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/auth/users/:id
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const userId = Number(id);

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(400).json({ error: 'ID invalido' });
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            await user.destroy();
            return res.json({ ok: true });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = userController;
