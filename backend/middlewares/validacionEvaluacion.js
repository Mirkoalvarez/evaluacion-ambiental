// backend/middlewares/validacionEvaluacion.js
const validarEvaluacion = (req, res, next) => {
  const { body } = req;
  
  // Validación básica de estructura: barrio_id ahora es el nombre del barrio
  if (!body.barrio_id || typeof body.barrio_id !== 'string' || body.barrio_id.trim() === '') {
    return res.status(400).json({ error: 'El nombre del barrio es requerido' });
  }

  next();
};

module.exports = validarEvaluacion;
