// backend/middlewares/validacionEvaluacionPatch.js

/**
 * Middleware de validación para PATCH de Evaluación.
 * - Valida solo los campos presentes.
 * - barrio_id (si viene): string no vacío (nombre del barrio).
 * - r3_3 (si viene): entero >= 0.
 * - El resto lo valida Sequelize (ENUMs) y el hook del modelo recalcula resultados.
 */
module.exports = (req, res, next) => {
  const { barrio_id, r3_3 } = req.body;

  if (typeof barrio_id !== 'undefined') {
    if (typeof barrio_id !== 'string' || barrio_id.trim().length === 0) {
      return res.status(400).json({
        error: "barrio_id (si se envía) debe ser el NOMBRE del barrio (string no vacío)."
      });
    }
  }

  if (typeof r3_3 !== 'undefined') {
    const n = Number(r3_3);
    if (!Number.isInteger(n) || n < 0) {
      return res.status(400).json({
        error: "r3_3 (si se envía) debe ser un entero >= 0 (cantidad de corrientes reciclables)."
      });
    }
  }

  return next();
};
