import { Router } from 'express';
import {
  createActivity,
  generateActivityWithAI,
  generateMultipleActivities,
  getActivities,
  getActivityById,
  updateActivity,
  updateActivityProgress,
  generateAudioForActivity,
  deleteActivity
} from '../controllers/activity.controller';
import {
  validateActivityCreation,
  validateActivityUpdate,
  validateMongoId,
  validatePagination,
  validateActivityFilters
} from '../middlewares/validation.middleware';
import {
  authenticateToken,
  requireTherapist,
  requireAnyRole
} from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
// router.use(authenticateToken);

// Rutas para actividades manuales
router.post('/', createActivity);
router.get('/', getActivities);
router.get('/:id', getActivityById);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

// Rutas para generación con IA
router.post('/generate-ai', authenticateToken, generateActivityWithAI);
router.post('/generate-multiple', generateMultipleActivities);

// Rutas para progreso y audio
router.put('/:id/progress', updateActivityProgress);
router.post('/:id/generate-audio', generateAudioForActivity);

export default router;
