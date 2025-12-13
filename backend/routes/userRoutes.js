// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middlewares/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/users', auth, userController.getUsers);
router.patch('/users/:id', auth, authorize('admin'), userController.updateUser);
router.delete('/users/:id', auth, authorize('admin'), userController.deleteUser);

module.exports = router;
