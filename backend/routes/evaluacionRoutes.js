// backend/routes/evaluacionRoutes.js
const express = require('express');
const router = express.Router();

const evaluacionController = require('../controllers/evaluacionController');
const validarEvaluacion = require('../middlewares/validacionEvaluacion');           // para POST
const validarEvaluacionPatch = require('../middlewares/validacionEvaluacionPatch'); // para PATCH
const { auth } = require('../middlewares/auth');

// Crear evaluación
router.post('/', auth, validarEvaluacion, evaluacionController.createEvaluacion);

// Obtener evaluación por id
router.get('/:id', auth, evaluacionController.getEvaluacionById);

// Actualizar parcialmente una evaluación existente
router.patch('/:id', auth, validarEvaluacionPatch, evaluacionController.patchEvaluacionById);

//DELETE
router.delete('/:id', auth, evaluacionController.deleteEvaluacionById);

module.exports = router;
