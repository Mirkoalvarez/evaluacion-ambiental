// backend/routes/barrioRoutes.js
const express = require('express');
const router = express.Router();
const barrioController = require('../controllers/barrioController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, barrioController.getAllBarrios);
router.post('/', auth, barrioController.createBarrio);

// cambiar nombre del barrio
router.patch('/:id', auth, barrioController.updateBarrio);

router.get('/:id/evaluaciones', auth, barrioController.getEvaluacionesByBarrio);
router.get('/:id/integrantes', auth, barrioController.listarIntegrantes);
router.post('/:id/integrantes', auth, barrioController.agregarIntegrante);
router.patch('/:id/integrantes/:userId', auth, barrioController.actualizarIntegrante);
router.delete('/:id/integrantes/:userId', auth, barrioController.eliminarIntegrante);

// DELETE
router.delete('/:id', auth, barrioController.deleteBarrio);
router.delete('/:id/evaluaciones/ultima', auth, barrioController.deleteUltimaEvaluacion);

module.exports = router;
