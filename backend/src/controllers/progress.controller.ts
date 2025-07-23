import { Request, Response } from 'express';
import { Progress, IProgress } from '../models/progress.model';
import { Activity } from '../models/activity.model';
import { Child } from '../models/child.model';
import { AIService } from '../services/ai.service';

interface AuthRequest extends Request {
  user?: any;
}

export const createProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const { childId, metrics, goals, notes } = req.body;
    res.status(201).json({
      message: 'Progreso demo registrado exitosamente',
      progress: {
        id: 'demo-progress',
        childId,
        metrics,
        goals,
        notes,
        therapistId: 'demo-therapist',
        createdAt: new Date().toISOString()
      }
    });
    return;
  }
  try {
    const {
      childId,
      metrics,
      goals,
      notes
    } = req.body;

    // Verificar que el niño existe
    const child = await Child.findById(childId);
    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    // Verificar permisos
    if (req.user?.role === 'padre' && child.parentId.toString() !== (req.user as any)._id.toString()) {
      res.status(403).json({ error: 'No tienes permisos para crear progreso para este niño' });
      return;
    }

    // Verificar si ya existe un progreso para hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingProgress = await Progress.findOne({
      childId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingProgress) {
      res.status(400).json({ error: 'Ya existe un registro de progreso para hoy' });
      return;
    }

    const progress = new Progress({
      childId,
      metrics,
      goals,
      notes,
      therapistId: req.user?.role === 'terapeuta' ? (req.user as any)._id : undefined
    });

    await progress.save();

    res.status(201).json({
      message: 'Progreso registrado exitosamente',
      progress
    });
  } catch (error) {
    console.error('Error creando progreso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.json({
      progress: [
        {
          id: 'demo-progress',
          childId: 'demo-child-1',
          metrics: {
            activitiesCompleted: 3,
            totalTimeSpent: 45,
            averageScore: 85
          },
          goals: {
            targetActivities: 5,
            targetTime: 60,
            targetScore: 80
          },
          notes: 'Buen avance',
          therapistId: 'demo-therapist',
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1
      }
    });
    return;
  }
  try {
    const { childId, startDate, endDate, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    
    if (childId) filter.childId = childId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const progress = await Progress.find(filter)
      .populate('childId', 'name age')
      .populate('therapistId', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ date: -1 });

    const total = await Progress.countDocuments(filter);

    res.json({
      progress,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo progreso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProgressById = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const { id } = req.params;
    if (id === 'demo-progress') {
      res.json({
        progress: {
          id: 'demo-progress',
          childId: 'demo-child-1',
          metrics: {
            activitiesCompleted: 3,
            totalTimeSpent: 45,
            averageScore: 85
          },
          goals: {
            targetActivities: 5,
            targetTime: 60,
            targetScore: 80
          },
          notes: 'Buen avance',
          therapistId: 'demo-therapist',
          createdAt: new Date().toISOString()
        }
      });
      return;
    } else {
      res.status(404).json({ error: 'Progreso demo no encontrado' });
      return;
    }
  }
  try {
    const { id } = req.params;

    const progress = await Progress.findById(id)
      .populate('childId', 'name age speechGoals')
      .populate('therapistId', 'name email');

    if (!progress) {
      res.status(404).json({ error: 'Progreso no encontrado' });
      return;
    }

    res.json({ progress });
  } catch (error) {
    console.error('Error obteniendo progreso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const updates = req.body;
    res.json({
      message: 'Progreso demo actualizado exitosamente',
      progress: {
        id: req.params.id || 'demo-progress',
        ...updates,
        updatedAt: new Date().toISOString()
      }
    });
    return;
  }
  try {
    const { id } = req.params;
    const updates = req.body;

    const progress = await Progress.findById(id);
    if (!progress) {
      res.status(404).json({ error: 'Progreso no encontrado' });
      return;
    }

    // Verificar permisos
    if (req.user?.role === 'terapeuta' && progress.therapistId?.toString() !== (req.user as any)._id.toString()) {
      res.status(403).json({ error: 'No tienes permisos para editar este progreso' });
      return;
    }

    const updatedProgress = await Progress.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('childId', 'name age')
     .populate('therapistId', 'name');

    res.json({
      message: 'Progreso actualizado exitosamente',
      progress: updatedProgress
    });
  } catch (error) {
    console.error('Error actualizando progreso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getChildProgressSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.json({
      summary: {
        totalProgressEntries: 5,
        averageScore: 88,
        totalTimeSpent: 200
      }
    });
    return;
  }
  try {
    const { childId } = req.params;
    const { period = '30' } = req.query; // días por defecto

    // Verificar que el niño existe
    const child = await Child.findById(childId);
    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    // Calcular fechas
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(period));

    // Obtener progreso del período
    const progressData = await Progress.find({
      childId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Obtener actividades completadas
    const completedActivities = await Activity.find({
      childId,
      'progress.completed': true,
      'progress.completedAt': { $gte: startDate, $lte: endDate }
    });

    // Calcular métricas
    const totalActivities = completedActivities.length;
    const totalTimeSpent = completedActivities.reduce((sum: number, activity: any) => 
      sum + (activity.progress.timeSpent || 0), 0
    );
    const averageScore = totalActivities > 0 
      ? completedActivities.reduce((sum: number, activity: any) => 
          sum + (activity.progress.score || 0), 0
        ) / totalActivities
      : 0;

    // Calcular tendencias
    const weeklyData = [];
    const weekStart = new Date(startDate);
    
    while (weekStart <= endDate) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekActivities = completedActivities.filter((activity: any) => {
        const completedAt = activity.progress.completedAt;
        return completedAt && completedAt >= weekStart && completedAt < weekEnd;
      });
      
      weeklyData.push({
        week: weekStart.toISOString().split('T')[0],
        activities: weekActivities.length,
        averageScore: weekActivities.length > 0 
          ? weekActivities.reduce((sum: number, activity: any) => 
              sum + (activity.progress.score || 0), 0
            ) / weekActivities.length
          : 0
      });
      
      weekStart.setDate(weekStart.getDate() + 7);
    }

    // Generar análisis con IA si hay datos suficientes
    let aiAnalysis = null;
    if (completedActivities.length > 0) {
      try {
        const analysisData = completedActivities.map((activity: any) => ({
          title: activity.title,
          type: activity.type,
          score: activity.progress.score,
          timeSpent: activity.progress.timeSpent,
          completedAt: activity.progress.completedAt
        }));

        aiAnalysis = await AIService.analyzeProgress(analysisData);
      } catch (error) {
        console.error('Error generando análisis con IA:', error);
      }
    }

    const summary = {
      childId: child._id,
      childName: child.name,
      period: `${period} días`,
      periodDates: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      metrics: {
        totalActivities,
        totalTimeSpent: Math.round(totalTimeSpent / 60), // en minutos
        averageScore: Math.round(averageScore * 100) / 100,
        completionRate: progressData.length > 0 
          ? (totalActivities / progressData.length) * 100 
          : 0
      },
      weeklyTrends: weeklyData,
      aiAnalysis,
      lastUpdated: new Date()
    };

    res.json({ summary });
  } catch (error) {
    console.error('Error obteniendo resumen de progreso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const generateProgressReport = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.json({
      message: 'Reporte demo generado exitosamente',
      report: {
        childId: req.body.childId || 'demo-child-1',
        generatedBy: 'demo-user',
        generatedAt: new Date().toISOString(),
        period: {
          start: req.body.startDate || '2024-01-01',
          end: req.body.endDate || '2024-01-31'
        },
        summary: {
          totalProgressEntries: 5,
          totalActivitiesCompleted: 4,
          averageScore: 90
        },
        aiAnalysis: 'Análisis demo generado por IA',
        detailedData: []
      }
    });
    return;
  }
  try {
    const { childId } = req.params;
    const { startDate, endDate } = req.body;

    // Verificar que el niño existe
    const child = await Child.findById(childId);
    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    // Verificar permisos
    if (req.user?.role === 'padre' && child.parentId.toString() !== (req.user as any)._id.toString()) {
      res.status(403).json({ error: 'No tienes permisos para generar reporte para este niño' });
      return;
    }

    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30); // Últimos 30 días por defecto
    
    const end = endDate ? new Date(endDate) : new Date();

    // Obtener datos del período
    const progressData = await Progress.find({
      childId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    const activitiesData = await Activity.find({
      childId,
      'progress.completedAt': { $gte: start, $lte: end }
    }).sort({ 'progress.completedAt': 1 });

    // Generar reporte con IA
    const reportData = {
      child: {
        name: child.name,
        age: child.age,
        currentLevel: child.currentLevel,
        speechGoals: child.speechGoals
      },
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      },
      progress: progressData,
      activities: activitiesData.map(activity => ({
        title: activity.title,
        type: activity.type,
        difficulty: activity.difficulty,
        score: activity.progress.score,
        timeSpent: activity.progress.timeSpent,
        completedAt: activity.progress.completedAt
      }))
    };

    const aiReport = await AIService.analyzeProgress(reportData.activities);

    const report = {
      childId: child._id,
      generatedBy: req.user?.name,
      generatedAt: new Date(),
      period: reportData.period,
      summary: {
        totalProgressEntries: progressData.length,
        totalActivitiesCompleted: activitiesData.length,
        averageScore: activitiesData.length > 0 
          ? activitiesData.reduce((sum: number, activity: any) => 
              sum + (activity.progress.score || 0), 0
            ) / activitiesData.length
          : 0
      },
      aiAnalysis: aiReport,
      detailedData: reportData
    };

    res.json({
      message: 'Reporte de progreso generado exitosamente',
      report
    });
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}; 