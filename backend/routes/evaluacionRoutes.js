// backend/routes/evaluacionRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const evaluacionController = require('../controllers/evaluacionController');
const validarEvaluacion = require('../middlewares/validacionEvaluacion');           // para POST
const validarEvaluacionPatch = require('../middlewares/validacionEvaluacionPatch'); // para PATCH
const { auth } = require('../middlewares/auth');

// Configuración de subida de archivos de evaluaciones
const storageEval = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads', 'evaluaciones'));
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const safeOriginal = file.originalname.replace(/[^\w.áéíóúÁÉÍÓÚñÑ()-]/g, '_');
        cb(null, `${unique}-${safeOriginal}`);
    },
});
const fileFilterEval = (req, file, cb) => {
    const allowed = /\.(xlsx?|csv|pdf|docx?|png|jpe?g)$/i.test(file.originalname);
    if (!allowed) return cb(new Error('Tipo de archivo no permitido'), false);
    cb(null, true);
};
const uploadEval = multer({
    storage: storageEval,
    fileFilter: fileFilterEval,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Crear evaluaciÃ³n
router.post('/', auth, validarEvaluacion, evaluacionController.createEvaluacion);

// Archivos de evaluaciÃ³n
router.get('/archivos/:archivoId/descargar', auth, evaluacionController.descargarArchivo);
router.delete('/archivos/:archivoId', auth, evaluacionController.eliminarArchivo);
router.get('/:id/archivos', auth, evaluacionController.listarArchivos);
router.post('/:id/archivos', auth, uploadEval.single('archivo'), evaluacionController.subirArchivo);

// Obtener evaluaciÃ³n por id
router.get('/:id', auth, evaluacionController.getEvaluacionById);

// Actualizar parcialmente una evaluaciÃ³n existente
router.patch('/:id', auth, validarEvaluacionPatch, evaluacionController.patchEvaluacionById);

//DELETE
router.delete('/:id', auth, evaluacionController.deleteEvaluacionById);

module.exports = router;
