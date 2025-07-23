import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  getAllUsers,
  getUserById,
  deactivateUser
} from '../controllers/user.controller';
import {
  validateUserRegistration,
  validateUserLogin,
  validateMongoId,
  validatePagination
} from '../middlewares/validation.middleware';

const router = Router();

// Rutas públicas
router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);

// Rutas antes protegidas, ahora públicas
router.get('/me', getCurrentUser);
router.put('/me', updateUser);
router.delete('/me', deactivateUser);
router.get('/', validatePagination, getAllUsers);
router.get('/:id', validateMongoId, getUserById);

export default router;
