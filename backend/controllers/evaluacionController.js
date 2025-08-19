// backend/controllers/evaluacionController.js
const { sequelize, Barrio, Evaluacion } = require('../models');
// Nota: el cálculo de resultados lo hace el hook beforeSave del modelo Evaluacion

const evaluacionController = {
    async createEvaluacion(req, res, next) {
        const t = await sequelize.transaction();
        try {
        const { barrio_id: barrioNombre, fecha, ...evaluacionData } = req.body;

        if (!barrioNombre || typeof barrioNombre !== 'string' || !barrioNombre.trim()) {
            await t.rollback();
            return res.status(400).json({ error: 'barrio_id debe ser el nombre del barrio (string no vacío)' });
        }

        const [barrio] = await Barrio.findOrCreate({
            where: { nombre: barrioNombre.trim() },
            transaction: t
        });

        const evaluacion = await Evaluacion.create(
            { 
                ...evaluacionData,
                barrio_id: barrio.id,
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
        return res.status(201).json(evaluacion);
        } catch (error) {
        await t.rollback();
        next(error);
        }
    },

    async getEvaluacionById(req, res, next) {
        try {
        const evaluacion = await Evaluacion.findByPk(req.params.id, {
            include: [{ model: Barrio, as: 'barrio', attributes: ['nombre'] }]
        });
        if (!evaluacion) return res.status(404).json({ error: 'Evaluación no encontrada' });
        res.json(evaluacion);
        } catch (error) { next(error); }
    },

    async patchEvaluacionById(req, res, next) {
        const t = await sequelize.transaction();
        try {
        const id = req.params.id;

        // 🚫 Ignorar barrio_id si viene en el body para NO reasignar la evaluación
        const { barrio_id, ...updatable } = req.body;

        let evaluacion = await Evaluacion.findByPk(id, { transaction: t });
        if (!evaluacion) {
            await t.rollback();
            return res.status(404).json({ error: 'Evaluación no encontrada' });
        }

        // si te preocupa formato, validá YYYY-MM-DD:
        if (typeof updatable.fecha !== 'undefined') {
            const ok = /^\d{4}-\d{2}-\d{2}$/.test(String(updatable.fecha));
            if (!ok) return res.status(400).json({ error: 'Formato de fecha inválido (YYYY-MM-DD)' });
        }
        // Copiamos solo los campos permitidos (todas las respuestas, obs, etc.)
        Object.keys(updatable).forEach((k) => {
            if (typeof updatable[k] !== 'undefined') {
            evaluacion[k] = updatable[k];
            }
        });

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
            include: [{ model: Barrio, as: 'barrio', attributes: ['nombre'] }]
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
        const { id } = req.params;
        const ev = await Evaluacion.findByPk(id, { transaction: t });
        if (!ev) {
            await t.rollback();
            return res.status(404).json({ error: 'Evaluación no encontrada' });
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
