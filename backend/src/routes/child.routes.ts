import { Router } from 'express';
import {
  createChild,
  getChildren,
  getChildById,
  updateChild,
  assignTherapist,
  removeTherapist,
  deactivateChild,
  getChildStats
} from '../controllers/child.controller';
import {
  validateChildCreation,
  validateMongoId,
  validatePagination
} from '../middlewares/validation.middleware';
import {
  authenticateToken,
  requireParent,
  requireTherapist,
  requireAnyRole
} from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
// router.use(authenticateToken);

// Rutas para padres
router.post('/', createChild);
router.get('/', getChildren);
router.get('/:id', getChildById);
router.put('/:id', updateChild);
router.delete('/:id', deactivateChild);

// Rutas para gestión de terapeutas
router.post('/:id/assign-therapist', assignTherapist);
router.delete('/:id/remove-therapist', removeTherapist);

// Rutas para estadísticas
router.get('/:id/stats', getChildStats);

export default router;
