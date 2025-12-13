// backend/controllers/evaluacionController.js
const { sequelize, Barrio, Evaluacion } = require('../models');
const {
    puedeVerBarrio,
    puedeCrearEvaluacion,
    puedeEditarEvaluacion,
} = require('../services/permisosService');

// Nota: el cálculo de resultados lo hace el hook beforeSave del modelo Evaluacion

const evaluacionController = {
    async createEvaluacion(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const user = req.user;
            const { barrio_id: barrioInput, fecha, ...evaluacionData } = req.body;

            if (!barrioInput) {
                await t.rollback();
                return res.status(400).json({ error: 'barrio_id es requerido' });
            }

            let barrio;
            if (Number.isInteger(barrioInput) || (!Number.isNaN(Number(barrioInput)) && Number(barrioInput) > 0)) {
                barrio = await Barrio.findByPk(Number(barrioInput));
            } else {
                barrio = await Barrio.findOne({ where: { nombre: String(barrioInput).trim() } });
            }

            if (!barrio) {
                await t.rollback();
                return res.status(404).json({ error: 'Barrio no encontrado' });
            }

            const autorizado = await puedeCrearEvaluacion(user, barrio.id);
            if (!autorizado) {
                await t.rollback();
                return res.status(403).json({ error: 'No autorizado' });
            }

            const evaluacion = await Evaluacion.create(
                { 
                    ...evaluacionData,
                    barrio_id: barrio.id,
                    creado_por: user.id,
                    editado_por: user.id,
                    ...(fecha ? { fecha } : {}), // si no viene, usa defaultValue del modelo
                },
                { transaction: t }
            );

            // Reflejamos en el barrio el resultado total de su evaluación más reciente
            await Barrio.update(
                { resultado_total: evaluacion.resultado_total },
                { where: { id: barrio.id }, transaction: t }
            );

            await t.commit();
            const conInclude = await Evaluacion.findByPk(evaluacion.id, {
                include: [
                    {
                        model: Barrio,
                        as: 'barrio',
                        attributes: ['id', 'nombre', 'autor_id'],
                        include: [{ association: 'autor', attributes: ['id', 'username', 'email', 'role'] }],
                    },
                    { association: 'creador', attributes: ['id', 'username', 'email', 'role'] },
                    { association: 'editor', attributes: ['id', 'username', 'email', 'role'] },
                ]
            });

            return res.status(201).json(conInclude);
        } catch (error) {
            await t.rollback();
            next(error);
        }
    },

    async getEvaluacionById(req, res, next) {
        try {
            const user = req.user;
            const evaluacion = await Evaluacion.findByPk(req.params.id, {
                include: [
                    {
                        model: Barrio,
                        as: 'barrio',
                        attributes: ['id', 'nombre', 'autor_id'],
                        include: [{ association: 'autor', attributes: ['id', 'username', 'email', 'role'] }],
                    },
                    { association: 'creador', attributes: ['id', 'username', 'email', 'role'] },
                    { association: 'editor', attributes: ['id', 'username', 'email', 'role'] },
                ]
            });
            if (!evaluacion) return res.status(404).json({ error: 'Evaluación no encontrada' });

            const puedeVer = await puedeVerBarrio(user, evaluacion.barrio_id);
            if (!puedeVer) return res.status(403).json({ error: 'No autorizado' });

            res.json(evaluacion);
        } catch (error) { next(error); }
    },

    async patchEvaluacionById(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const user = req.user;
            const id = req.params.id;

            // Ignorar barrio_id si viene en el body para NO reasignar la evaluación
            const { barrio_id, ...updatable } = req.body;

            let evaluacion = await Evaluacion.findByPk(id, { transaction: t });
            if (!evaluacion) {
                await t.rollback();
                return res.status(404).json({ error: 'Evaluación no encontrada' });
            }

            const autorizado = await puedeEditarEvaluacion(user, evaluacion);
            if (!autorizado) {
                await t.rollback();
                return res.status(403).json({ error: 'No autorizado' });
            }

            // valida YYYY-MM-DD:
            if (typeof updatable.fecha !== 'undefined') {
                const ok = /^\d{4}-\d{2}-\d{2}$/.test(String(updatable.fecha));
                if (!ok) {
                    await t.rollback();
                    return res.status(400).json({ error: 'Formato de fecha invalido (YYYY-MM-DD)' });
                }
            }
            // Copiamos solo los campos permitidos (todas las respuestas, obs, etc.)
            Object.keys(updatable).forEach((k) => {
                if (typeof updatable[k] !== 'undefined') {
                    evaluacion[k] = updatable[k];
                }
            });

            evaluacion.editado_por = user.id;

            // Guardar (hook beforeSave recalcula puntajes y letras)
            await evaluacion.save({ transaction: t });

            // Si esta evaluación es la más reciente del barrio, reflejar resultado_total en el barrio
            const barrio = await Barrio.findByPk(evaluacion.barrio_id, { transaction: t });
            const masReciente = await Evaluacion.findOne({
                where: { barrio_id: evaluacion.barrio_id },
                order: [['created_at', 'DESC'], ['updated_at', 'DESC']],
                transaction: t
            });

            if (masReciente && masReciente.id === evaluacion.id) {
                await barrio.update(
                    { resultado_total: evaluacion.resultado_total },
                    { transaction: t }
                );
            }

            await t.commit();

            // Devolver con include del barrio
            evaluacion = await Evaluacion.findByPk(id, {
                include: [
                    {
                        model: Barrio,
                        as: 'barrio',
                        attributes: ['id', 'nombre', 'autor_id'],
                        include: [{ association: 'autor', attributes: ['id', 'username', 'email', 'role'] }],
                    },
                    { association: 'creador', attributes: ['id', 'username', 'email', 'role'] },
                    { association: 'editor', attributes: ['id', 'username', 'email', 'role'] },
                ]
            });

            return res.json(evaluacion);
        } catch (error) {
            await t.rollback();
            next(error);
        }
    },

    // DELETE /api/evaluaciones/:id
    async deleteEvaluacionById(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const user = req.user;
            const { id } = req.params;
            const ev = await Evaluacion.findByPk(id, { transaction: t });
            if (!ev) {
                await t.rollback();
                return res.status(404).json({ error: 'Evaluación no encontrada' });
            }
            const autorizado = await puedeEditarEvaluacion(user, ev);
            if (!autorizado) {
                await t.rollback();
                return res.status(403).json({ error: 'No autorizado' });
            }

            const barrioId = ev.barrio_id;
            await ev.destroy({ transaction: t });

            // actualizar resultado_total del barrio si borramos la más reciente
            const barrio = await Barrio.findByPk(barrioId, { transaction: t });
            const masReciente = await Evaluacion.findOne({
                where: { barrio_id: barrioId },
                order: [['fecha', 'DESC'], ['created_at', 'DESC'], ['updated_at', 'DESC']],
                transaction: t,
            });

            await barrio.update(
                { resultado_total: masReciente ? masReciente.resultado_total : null },
                { transaction: t }
            );

            await t.commit();
            return res.json({ ok: true });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    }
};

module.exports = evaluacionController;
