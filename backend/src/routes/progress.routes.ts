import { Router } from 'express';
import {
  createProgress,
  getProgress,
  getProgressById,
  updateProgress,
  getChildProgressSummary,
  generateProgressReport
} from '../controllers/progress.controller';
import {
  validateProgressCreation,
  validateMongoId,
  validatePagination
} from '../middlewares/validation.middleware';
import {
  authenticateToken,
  requireTherapist,
  requireAnyRole
} from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
// router.use(authenticateToken);

// Rutas básicas de progreso
router.post('/', createProgress);
router.get('/', getProgress);
router.get('/:id', getProgressById);
router.put('/:id', updateProgress);

// Rutas de resumen y reportes
router.get('/child/:childId/summary', getChildProgressSummary);
router.get('/report', generateProgressReport);

export default router; 