// backend/routes/barrioRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const barrioController = require('../controllers/barrioController');
const { auth } = require('../middlewares/auth');

const storageBarrio = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads', 'barrios'));
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const safeOriginal = file.originalname.replace(/[^\w.áéíóúÁÉÍÓÚñÑ()-]/g, '_');
        cb(null, `${unique}-${safeOriginal}`);
    },
});
const fileFilterBarrio = (req, file, cb) => {
    const allowed = /\.(png|jpe?g|webp)$/i.test(file.originalname);
    if (!allowed) return cb(new Error('Solo imágenes PNG/JPG/WEBP'), false);
    cb(null, true);
};
const uploadBarrio = multer({
    storage: storageBarrio,
    fileFilter: fileFilterBarrio,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.get('/', auth, barrioController.getAllBarrios);
router.post('/', auth, barrioController.createBarrio);

// Imagen principal
router.post('/:id/imagen', auth, uploadBarrio.single('imagen'), barrioController.subirImagen);
router.delete('/:id/imagen', auth, barrioController.eliminarImagen);

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
