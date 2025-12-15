// backend/controllers/barrioController.js
const { Op } = require('sequelize');
const { Barrio, Evaluacion, sequelize, BarrioMember, User, BarrioImagen } = require('../models');
const fs = require('fs');
const path = require('path');
const {
    isAdmin,
    isModerador,
    puedeVerBarrio,
    puedeEditarBarrio,
    asegurarModeradorInicial
} = require('../services/permisosService');

const barrioController = {
    // GET /api/barrios
    async getAllBarrios(req, res, next) {
        try {
            const user = req.user;
            const userId = Number(user.id);
            let barrios;

            const includeAutor = [
                { association: 'autor', attributes: ['id', 'username', 'email', 'role'] },
                { association: 'imagen', attributes: ['id', 'path', 'original_name'] },
            ];

            if (isAdmin(user) || isModerador(user)) {
                barrios = await Barrio.findAll({
                    attributes: ['id', 'nombre', 'resultado_total', 'autor_id'],
                    include: includeAutor,
                    order: [['nombre', 'ASC']],
                });
            } else {
                barrios = await Barrio.findAll({
                    attributes: ['id', 'nombre', 'resultado_total', 'autor_id'],
                    include: [
                        ...includeAutor,
                        {
                            association: 'miembros',
                            attributes: ['id'],
                            through: { attributes: [], where: { user_id: userId } },
                            required: false,
                        },
                    ],
                    where: {
                        [Op.or]: [
                            { autor_id: userId },
                            sequelize.literal(`EXISTS (SELECT 1 FROM barrio_members bm WHERE bm.barrio_id = "Barrio"."id" AND bm.user_id = ${userId})`)
                        ]
                    },
                    order: [['nombre', 'ASC']],
                });
            }

            res.json(barrios);
        } catch (error) { next(error); }
    },

    // POST /api/barrios
    async createBarrio(req, res, next) {
        try {
            const user = req.user;
            const { nombre, moderador_id } = req.body;

            if (!nombre || !nombre.trim()) {
                return res.status(400).json({ error: 'El nombre del barrio es requerido' });
            }

            const existente = await Barrio.findOne({ where: { nombre: nombre.trim() } });
            if (existente) {
                return res.status(409).json({ error: 'Ya existe un barrio con ese nombre' });
            }

            const necesitaModerador = user.role !== 'moderador';
            let moderador = null;
            if (necesitaModerador) {
                const mid = Number(moderador_id);
                if (!mid || Number.isNaN(mid)) {
                    return res.status(400).json({ error: 'Debes elegir un moderador para este barrio' });
                }
                moderador = await User.findByPk(mid);
                if (!moderador || moderador.role !== 'moderador') {
                    return res.status(400).json({ error: 'El usuario elegido no es moderador' });
                }
            }

            const t = await sequelize.transaction();
            try {
                const barrio = await Barrio.create(
                    { nombre: nombre.trim(), autor_id: user.id },
                    { transaction: t }
                );

                await asegurarModeradorInicial(barrio, user, moderador?.id || moderador_id, t);

                await t.commit();
                res.status(201).json(barrio);
            } catch (err) {
                await t.rollback();
                return res.status(400).json({ error: err.message || 'No se pudo crear el barrio' });
            }
        } catch (error) { next(error); }
    },

    // PATCH /api/barrios/:id  -> { nombre }
    async updateBarrio(req, res, next) {
        try {
            const user = req.user;
            const id = req.params.id;
            const { nombre } = req.body;

            const barrio = await Barrio.findByPk(id);
            if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });

            if (barrio.autor_id !== user.id) {
                return res.status(403).json({ error: 'Solo el autor puede subir la imagen' });
            }

            if (nombre !== undefined) {
                if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
                    return res.status(400).json({ error: 'El nombre es requerido y no puede estar vacio' });
                }
                const nuevo = nombre.trim();
                if (barrio.nombre !== nuevo) {
                    const yaExiste = await Barrio.findOne({ where: { nombre: nuevo } });
                    if (yaExiste && yaExiste.id !== barrio.id) {
                        return res.status(409).json({ error: 'Ya existe un barrio con ese nombre' });
                    }
                    barrio.nombre = nuevo;
                }
            }

            await barrio.save();
            return res.json(barrio);
        } catch (error) { next(error); }
    },

    // POST /api/barrios/:id/imagen  -> reemplaza la imagen principal
    async subirImagen(req, res, next) {
        try {
            const user = req.user;
            const barrioId = req.params.id;
            const file = req.file;

            if (!file) return res.status(400).json({ error: 'Imagen requerida' });

            const barrio = await Barrio.findByPk(barrioId);
            if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });

            const puedeEditar = await puedeEditarBarrio(user, barrio.id);
            if (!(puedeEditar || isAdmin(user) || isModerador(user))) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const anterior = await BarrioImagen.findOne({ where: { barrio_id: barrioId } });
            if (anterior) {
                try {
                    const abs = path.join(__dirname, '..', anterior.path.replace(/^[\\/]/, ''));
                    if (fs.existsSync(abs)) fs.unlinkSync(abs);
                } catch (e) {
                    console.warn('No se pudo borrar la imagen previa', e.message);
                }
                await BarrioImagen.destroy({ where: { barrio_id: barrioId } });
            }

            const registro = await BarrioImagen.create({
                barrio_id: barrioId,
                file_name: file.filename,
                original_name: file.originalname,
                mime_type: file.mimetype,
                size: file.size,
                path: `/uploads/barrios/${file.filename}`,
            });

            return res.status(201).json(registro);
        } catch (error) { next(error); }
    },

    // DELETE /api/barrios/:id/imagen -> elimina la imagen asociada
    async eliminarImagen(req, res, next) {
        try {
            const user = req.user;
            const barrioId = req.params.id;
            const barrio = await Barrio.findByPk(barrioId);
            if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });

            const puedeEditar = await puedeEditarBarrio(user, barrio.id);
            if (!(puedeEditar || isAdmin(user) || isModerador(user))) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const img = await BarrioImagen.findOne({ where: { barrio_id: barrioId } });
            if (!img) return res.status(404).json({ error: 'El barrio no tiene imagen' });

            try {
                const abs = path.join(__dirname, '..', img.path.replace(/^[\\/]/, ''));
                if (fs.existsSync(abs)) fs.unlinkSync(abs);
            } catch (e) {
                console.warn('No se pudo borrar la imagen del barrio', e.message);
            }

            await BarrioImagen.destroy({ where: { barrio_id: barrioId } });
            return res.json({ ok: true });
        } catch (error) { next(error); }
    },

    // GET /api/barrios/:id/evaluaciones
    async getEvaluacionesByBarrio(req, res, next) {
        try {
            const user = req.user;
            const barrioId = req.params.id;
            const barrio = await Barrio.findByPk(barrioId);
            if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });

            const puedeVer = await puedeVerBarrio(user, barrioId);
            if (!puedeVer) return res.status(403).json({ error: 'No autorizado' });

            const evaluaciones = await Evaluacion.findAll({
                where: { barrio_id: barrioId },
                include: [
                    { association: 'creador', attributes: ['id', 'username', 'email', 'role'] },
                    { association: 'editor', attributes: ['id', 'username', 'email', 'role'] },
                ],
                order: [
                    ['fecha', 'DESC'],        // si usas DATEONLY en Evaluacion
                    ['created_at', 'DESC'],
                    ['updated_at', 'DESC'],
                ],
            });
            res.json(evaluaciones);
        } catch (error) { next(error); }
    },

    // GET /api/barrios/:id/integrantes
    async listarIntegrantes(req, res, next) {
        try {
            const user = req.user;
            const barrioId = req.params.id;
            const barrio = await Barrio.findByPk(barrioId);
            if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });

            const puede = await puedeVerBarrio(user, barrioId);
            if (!puede) return res.status(403).json({ error: 'No autorizado' });

            const integrantes = await BarrioMember.findAll({
                where: { barrio_id: barrioId },
                include: [{ model: User, as: 'usuario', attributes: ['id', 'username', 'email', 'role'] }],
                order: [['created_at', 'ASC']]
            });

            res.json(integrantes.map(m => ({
                user_id: m.user_id,
                puede_editar_todas: m.puede_editar_todas,
                es_moderador_barrio: m.es_moderador_barrio,
                usuario: m.usuario,
                created_at: m.createdAt,
                updated_at: m.updatedAt,
            })));
        } catch (error) { next(error); }
    },

    // POST /api/barrios/:id/integrantes
    async agregarIntegrante(req, res, next) {
        try {
            const user = req.user;
            const barrioId = req.params.id;
            const { user_id, puede_editar_todas } = req.body;

            const barrio = await Barrio.findByPk(barrioId);
            if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });

            if (!(isAdmin(user) || isModerador(user) || barrio.autor_id === user.id)) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const invitado = await User.findByPk(user_id);
            if (!invitado) return res.status(404).json({ error: 'Usuario no encontrado' });
            if (invitado.role === 'admin') {
                return res.status(400).json({ error: 'No se puede agregar un administrador como integrante' });
            }

            const existente = await BarrioMember.findOne({ where: { barrio_id: barrioId, user_id } });
            if (existente) return res.status(409).json({ error: 'Ya es integrante' });

            const miembro = await BarrioMember.create({
                barrio_id: barrioId,
                user_id,
                puede_editar_todas: Boolean(puede_editar_todas),
                es_moderador_barrio: invitado.role === 'moderador',
            });

            const conUsuario = await BarrioMember.findByPk(miembro.id, {
                include: [{ model: User, as: 'usuario', attributes: ['id', 'username', 'email', 'role'] }]
            });

            res.status(201).json({
                user_id: conUsuario.user_id,
                puede_editar_todas: conUsuario.puede_editar_todas,
                es_moderador_barrio: conUsuario.es_moderador_barrio,
                usuario: conUsuario.usuario,
                created_at: conUsuario.createdAt,
                updated_at: conUsuario.updatedAt,
            });
        } catch (error) { next(error); }
    },

    // PATCH /api/barrios/:id/integrantes/:userId
    async actualizarIntegrante(req, res, next) {
        try {
            const user = req.user;
            const barrioId = req.params.id;
            const userId = req.params.userId;
            const { puede_editar_todas } = req.body;

            const barrio = await Barrio.findByPk(barrioId);
            if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });

            if (!(isAdmin(user) || isModerador(user) || barrio.autor_id === user.id)) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const miembro = await BarrioMember.findOne({ where: { barrio_id: barrioId, user_id: userId } });
            if (!miembro) return res.status(404).json({ error: 'Integrante no encontrado' });

            if (typeof puede_editar_todas !== 'undefined') {
                miembro.puede_editar_todas = Boolean(puede_editar_todas);
            }

            await miembro.save();
            res.json(miembro);
        } catch (error) { next(error); }
    },

    // DELETE /api/barrios/:id/integrantes/:userId
    async eliminarIntegrante(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const user = req.user;
            const barrioId = req.params.id;
            const userId = req.params.userId;

            const barrio = await Barrio.findByPk(barrioId, { transaction: t });
            if (!barrio) {
                await t.rollback();
                return res.status(404).json({ error: 'Barrio no encontrado' });
            }

            if (!(isAdmin(user) || isModerador(user) || barrio.autor_id === user.id)) {
                await t.rollback();
                return res.status(403).json({ error: 'No autorizado' });
            }

            if (Number(userId) === barrio.autor_id) {
                await t.rollback();
                return res.status(400).json({ error: 'No puedes eliminar al autor del barrio' });
            }

            const miembro = await BarrioMember.findOne({
                where: { barrio_id: barrioId, user_id: userId },
                transaction: t,
                include: [{ model: User, as: 'usuario', attributes: ['role'] }]
            });

            if (!miembro) {
                await t.rollback();
                return res.status(404).json({ error: 'Integrante no encontrado' });
            }

            const esModerador = miembro.es_moderador_barrio || miembro.usuario?.role === 'moderador';
            if (esModerador && !isAdmin(user)) {
                await t.rollback();
                return res.status(403).json({ error: 'No puedes eliminar a un moderador' });
            }

            const moderadoresRestantes = await BarrioMember.count({
                where: { barrio_id: barrioId, user_id: { [Op.ne]: userId } },
                include: [{
                    model: User,
                    as: 'usuario',
                    required: true,
                    where: { role: 'moderador' }
                }],
                transaction: t
            });

            if (esModerador && moderadoresRestantes === 0) {
                await t.rollback();
                return res.status(400).json({ error: 'El barrio debe conservar al menos un moderador' });
            }

            await miembro.destroy({ transaction: t });
            await t.commit();
            return res.json({ ok: true });
        } catch (error) {
            await t.rollback();
            next(error);
        }
    },

    // DELETE /api/barrios/:id  -> borra el barrio y TODAS sus evaluaciones
    async deleteBarrio(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const user = req.user;
            const id = req.params.id;
            const barrio = await Barrio.findByPk(id, { transaction: t });
            if (!barrio) {
                await t.rollback();
                return res.status(404).json({ error: 'Barrio no encontrado' });
            }

            if (!(isAdmin(user) || isModerador(user) || barrio.autor_id === user.id)) {
                await t.rollback();
                return res.status(403).json({ error: 'No autorizado' });
            }

            // Borrar imagen (archivo y registro)
            const img = await BarrioImagen.findOne({ where: { barrio_id: id }, transaction: t });
            if (img) {
                try {
                    const abs = path.join(__dirname, '..', img.path.replace(/^[\\/]/, ''));
                    if (fs.existsSync(abs)) fs.unlinkSync(abs);
                } catch (e) {
                    console.warn('No se pudo borrar la imagen del barrio', e.message);
                }
                await BarrioImagen.destroy({ where: { barrio_id: id }, transaction: t });
            }

            // Si no tenes cascada en las relaciones, borra evaluaciones manualmente
            await Evaluacion.destroy({ where: { barrio_id: id }, transaction: t });
            await BarrioMember.destroy({ where: { barrio_id: id }, transaction: t });

            await barrio.destroy({ transaction: t });
            await t.commit();
            return res.json({ ok: true });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },

    // DELETE /api/barrios/:id/evaluaciones/ultima -> borra la evaluacion mas reciente del barrio
    async deleteUltimaEvaluacion(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const user = req.user;
            const barrioId = req.params.id;
            const barrio = await Barrio.findByPk(barrioId, { transaction: t });
            if (!barrio) {
                await t.rollback();
                return res.status(404).json({ error: 'Barrio no encontrado' });
            }

            if (!(isAdmin(user) || isModerador(user) || barrio.autor_id === user.id)) {
                await t.rollback();
                return res.status(403).json({ error: 'No autorizado' });
            }

            const ultima = await Evaluacion.findOne({
                where: { barrio_id: barrioId },
                order: [['fecha', 'DESC'], ['created_at', 'DESC'], ['updated_at', 'DESC']],
                transaction: t
            });

            if (!ultima) {
                await t.rollback();
                return res.status(404).json({ error: 'El barrio no tiene evaluaciones' });
            }

            await ultima.destroy({ transaction: t });

            // Opcional: actualizar resultado_total del barrio a la evaluacion ahora mas reciente (o null)
            const siguiente = await Evaluacion.findOne({
                where: { barrio_id: barrioId },
                order: [['fecha', 'DESC'], ['created_at', 'DESC'], ['updated_at', 'DESC']],
                transaction: t
            });

            await barrio.update(
                { resultado_total: siguiente ? siguiente.resultado_total : null },
                { transaction: t }
            );

            await t.commit();
            return res.json({ ok: true });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },
};

module.exports = barrioController;
