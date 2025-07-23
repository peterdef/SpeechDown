import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors.array()
    });
    return;
  }
  next();
};

// Validaciones para usuarios
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .isIn(['terapeuta', 'padre'])
    .withMessage('El rol debe ser terapeuta o padre'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Número de teléfono inválido'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  handleValidationErrors
];

// Validaciones para niños
export const validateChildCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('age')
    .isInt({ min: 0, max: 18 })
    .withMessage('La edad debe estar entre 0 y 18 años'),
  body('gender')
    .isIn(['masculino', 'femenino', 'otro'])
    .withMessage('El género debe ser masculino, femenino u otro'),
  body('speechGoals')
    .isArray({ min: 1 })
    .withMessage('Debe especificar al menos un objetivo de terapia'),
  body('speechGoals.*')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Cada objetivo debe tener entre 1 y 200 caracteres'),
  body('currentLevel')
    .optional()
    .isIn(['inicial', 'intermedio', 'avanzado'])
    .withMessage('El nivel debe ser inicial, intermedio o avanzado'),
  handleValidationErrors
];

// Validaciones para actividades
export const validateActivityCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('El título debe tener entre 5 y 200 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
  body('type')
    .isIn(['cuento', 'juego_palabras', 'articulacion', 'fluidez', 'comprension'])
    .withMessage('Tipo de actividad inválido'),
  body('difficulty')
    .isIn(['facil', 'medio', 'dificil'])
    .withMessage('La dificultad debe ser fácil, medio o difícil'),
  body('childId')
    .isMongoId()
    .withMessage('ID de niño inválido'),
  body('content.text')
    .trim()
    .isLength({ min: 10 })
    .withMessage('El contenido debe tener al menos 10 caracteres'),
  body('content.instructions')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Las instrucciones deben tener al menos 10 caracteres'),
  body('content.expectedDuration')
    .isInt({ min: 1, max: 60 })
    .withMessage('La duración debe estar entre 1 y 60 minutos'),
  handleValidationErrors
];

export const validateActivityUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('El título debe tener entre 5 y 200 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
  body('type')
    .optional()
    .isIn(['cuento', 'juego_palabras', 'articulacion', 'fluidez', 'comprension'])
    .withMessage('Tipo de actividad inválido'),
  body('difficulty')
    .optional()
    .isIn(['facil', 'medio', 'dificil'])
    .withMessage('La dificultad debe ser fácil, medio o difícil'),
  handleValidationErrors
];

// Validaciones para progreso
export const validateProgressCreation = [
  body('childId')
    .isMongoId()
    .withMessage('ID de niño inválido'),
  body('metrics.activitiesCompleted')
    .isInt({ min: 0 })
    .withMessage('El número de actividades no puede ser negativo'),
  body('metrics.totalTimeSpent')
    .isInt({ min: 0 })
    .withMessage('El tiempo total no puede ser negativo'),
  body('metrics.averageScore')
    .isFloat({ min: 0, max: 100 })
    .withMessage('El puntaje promedio debe estar entre 0 y 100'),
  body('goals.targetActivities')
    .isInt({ min: 1 })
    .withMessage('El objetivo de actividades debe ser al menos 1'),
  body('goals.targetTime')
    .isInt({ min: 1 })
    .withMessage('El objetivo de tiempo debe ser al menos 1 minuto'),
  body('goals.targetScore')
    .isFloat({ min: 0, max: 100 })
    .withMessage('El objetivo de puntaje debe estar entre 0 y 100'),
  handleValidationErrors
];

// Validaciones para parámetros de ruta
export const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('ID inválido'),
  handleValidationErrors
];

// Validaciones para consultas
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  handleValidationErrors
];

export const validateActivityFilters = [
  query('type')
    .optional()
    .isIn(['cuento', 'juego_palabras', 'articulacion', 'fluidez', 'comprension'])
    .withMessage('Tipo de actividad inválido'),
  query('difficulty')
    .optional()
    .isIn(['facil', 'medio', 'dificil'])
    .withMessage('Dificultad inválida'),
  query('aiGenerated')
    .optional()
    .isBoolean()
    .withMessage('aiGenerated debe ser true o false'),
  handleValidationErrors
]; 