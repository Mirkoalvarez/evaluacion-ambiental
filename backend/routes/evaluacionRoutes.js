// backend/routes/evaluacionRoutes.js
const express = require('express');
const router = express.Router();

const evaluacionController = require('../controllers/evaluacionController');
const validarEvaluacion = require('../middlewares/validacionEvaluacion');           // para POST
const validarEvaluacionPatch = require('../middlewares/validacionEvaluacionPatch'); // para PATCH

// Crear evaluación
router.post('/', validarEvaluacion, evaluacionController.createEvaluacion);

// Obtener evaluación por id
router.get('/:id', evaluacionController.getEvaluacionById);

// Actualizar parcialmente una evaluación existente
router.patch('/:id', validarEvaluacionPatch, evaluacionController.patchEvaluacionById);

//DELETE
router.delete('/:id', evaluacionController.deleteEvaluacionById);

module.exports = router;
