// backend/controllers/barrioController.js
const { Barrio, Evaluacion, sequelize  } = require('../models');

const barrioController = {
    // GET /api/barrios
    async getAllBarrios(req, res, next) {
        try {
        const barrios = await Barrio.findAll({
            attributes: ['id', 'nombre', 'resultado_total'],
            order: [['nombre', 'ASC']],
        });
        res.json(barrios);
        } catch (error) { next(error); }
    },

    // POST /api/barrios
    async createBarrio(req, res, next) {
        try {
        const { nombre } = req.body;
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ error: 'El nombre del barrio es requerido' });
        }
        const [barrio, created] = await Barrio.findOrCreate({ where: { nombre: nombre.trim() } });
        res.status(created ? 201 : 200).json(barrio);
        } catch (error) { next(error); }
    },

    // PATCH /api/barrios/:id  -> { nombre }
    async updateBarrio(req, res, next) {
        try {
        const id = req.params.id;
        const { nombre } = req.body;

        if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
            return res.status(400).json({ error: 'El nombre es requerido y no puede estar vacío' });
        }

        const barrio = await Barrio.findByPk(id);
        if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });

        const nuevo = nombre.trim();

        if (barrio.nombre === nuevo) {
            return res.json(barrio);
        }

        const yaExiste = await Barrio.findOne({ where: { nombre: nuevo } });
        if (yaExiste && yaExiste.id !== barrio.id) {
            return res.status(409).json({ error: 'Ya existe un barrio con ese nombre' });
        }

        barrio.nombre = nuevo;
        await barrio.save();

        return res.json(barrio);
        } catch (error) { next(error); }
    },

    // GET /api/barrios/:id/evaluaciones
    async getEvaluacionesByBarrio(req, res, next) {
        try {
        const barrioId = req.params.id;
        const barrio = await Barrio.findByPk(barrioId);
        if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });

        const evaluaciones = await Evaluacion.findAll({
            where: { barrio_id: barrioId },
            order: [
            ['fecha', 'DESC'],        // si usás DATEONLY en Evaluacion
            ['created_at', 'DESC'],
            ['updated_at', 'DESC'],
            ],
        });
        res.json(evaluaciones);
        } catch (error) { next(error); }
    },

    // DELETE /api/barrios/:id  -> borra el barrio y TODAS sus evaluaciones
    async deleteBarrio(req, res, next) {
        const t = await sequelize.transaction();
        try {
        const id = req.params.id;
        const barrio = await Barrio.findByPk(id, { transaction: t });
        if (!barrio) {
            await t.rollback();
            return res.status(404).json({ error: 'Barrio no encontrado' });
        }

        // Si no tenés cascada en las relaciones, borrá evaluaciones manualmente
        await Evaluacion.destroy({ where: { barrio_id: id }, transaction: t });

        await barrio.destroy({ transaction: t });
        await t.commit();
        return res.json({ ok: true });
        } catch (err) {
        await t.rollback();
        next(err);
        }
    },

    // DELETE /api/barrios/:id/evaluaciones/ultima -> borra la evaluación más reciente del barrio
    async deleteUltimaEvaluacion(req, res, next) {
        const t = await sequelize.transaction();
        try {
        const barrioId = req.params.id;
        const barrio = await Barrio.findByPk(barrioId, { transaction: t });
        if (!barrio) {
            await t.rollback();
            return res.status(404).json({ error: 'Barrio no encontrado' });
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

        // Opcional: actualizar resultado_total del barrio a la evaluación ahora más reciente (o null)
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
