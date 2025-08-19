// backend/routes/barrioRoutes.js
const express = require('express');
const router = express.Router();
const barrioController = require('../controllers/barrioController');

router.get('/', barrioController.getAllBarrios);
router.post('/', barrioController.createBarrio);

//cambiar nombre del barrio
router.patch('/:id', barrioController.updateBarrio);

router.get('/:id/evaluaciones', barrioController.getEvaluacionesByBarrio);

// DELETE
router.delete('/:id', barrioController.deleteBarrio);
router.delete('/:id/evaluaciones/ultima', barrioController.deleteUltimaEvaluacion);

module.exports = router;
