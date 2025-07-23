import { Request, Response } from 'express';
import { Activity, IActivity } from '../models/activity.model';
import { Child } from '../models/child.model';
import { AIService, ActivityGenerationParams } from '../services/ai.service';
import { TTSService } from '../services/tts.service';

interface AuthRequest extends Request {
  user?: any;
}

export const createActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const { title, description, type, difficulty, childId, content, tags = [] } = req.body;
    res.status(201).json({
      message: 'Actividad demo creada exitosamente',
      activity: {
        id: 'demo-activity',
        title,
        description,
        type,
        difficulty,
        childId,
        therapistId: 'demo-therapist',
        aiGenerated: false,
        content,
        tags,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });
    return;
  }
  try {
    const {
      title,
      description,
      type,
      difficulty,
      childId,
      content,
      tags = []
    } = req.body;

    // Verificar que el niño existe
    const child = await Child.findById(childId);
    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    // Crear la actividad
    const activity = new Activity({
      title,
      description,
      type,
      difficulty,
      childId,
      therapistId: req.user?.role === 'terapeuta' ? (req.user as any)._id : undefined,
      aiGenerated: false,
      content,
      tags
    });

    await activity.save();

    res.status(201).json({
      message: 'Actividad creada exitosamente',
      activity
    });
  } catch (error) {
    console.error('Error creando actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const generateActivityWithAI = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const { childId, type, difficulty, theme, generateAudio = false } = req.body;
    res.status(201).json({
      message: 'Actividad demo generada con IA exitosamente',
      activity: {
        id: 'demo-activity-ai',
        title: 'Actividad IA Demo',
        description: `Actividad generada con IA sobre ${theme}`,
        type,
        difficulty,
        childId,
        therapistId: 'demo-therapist',
        aiGenerated: true,
        content: {
          text: 'Texto demo IA',
          instructions: 'Instrucciones demo',
          expectedDuration: 10,
          ...(generateAudio && { audioUrl: 'https://demo/audio.mp3' })
        },
        tags: [theme],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });
    return;
  }
  try {
    const {
      childId,
      type,
      difficulty,
      theme,
      generateAudio = false
    } = req.body;

    // Verificar que el niño existe
    const child = await Child.findById(childId);
    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    // Parámetros para la generación de IA
    const aiParams: ActivityGenerationParams = {
      childName: child.name,
      age: child.age,
      type,
      difficulty,
      speechGoals: child.speechGoals,
      theme
    };

    // Generar actividad con IA
    const generatedActivity = await AIService.generateActivity(aiParams);

    // Crear la actividad en la base de datos
    const activity = new Activity({
      title: generatedActivity.title,
      description: generatedActivity.description,
      type,
      difficulty,
      childId,
      therapistId: req.user?.role === 'terapeuta' ? (req.user as any)._id : undefined,
      aiGenerated: true,
      content: {
        text: generatedActivity.content.text,
        instructions: generatedActivity.content.instructions,
        expectedDuration: generatedActivity.content.expectedDuration
      },
      tags: generatedActivity.tags
    });

    // Generar audio si se solicita
    if (generateAudio) {
      try {
        const audioResponse = await TTSService.synthesizeSpeechForChild(
          generatedActivity.content.text,
          child.age
        );
        activity.content.audioUrl = audioResponse.audioUrl;
      } catch (audioError) {
        console.error('Error generando audio:', audioError);
        // Continuar sin audio si falla
      }
    }

    await activity.save();

    res.status(201).json({
      message: 'Actividad generada con IA exitosamente',
      activity
    });
  } catch (error) {
    console.error('Error generando actividad con IA:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const generateMultipleActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      childId,
      type,
      difficulty,
      theme,
      count = 3,
      generateAudio = false
    } = req.body;

    // Verificar que el niño existe
    const child = await Child.findById(childId);
    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    // Parámetros para la generación de IA
    const aiParams: ActivityGenerationParams = {
      childName: child.name,
      age: child.age,
      type,
      difficulty,
      speechGoals: child.speechGoals,
      theme
    };

    // Generar múltiples actividades
    const generatedActivities = await AIService.generateMultipleActivities(aiParams, count);
    const savedActivities = [];

    for (const generatedActivity of generatedActivities) {
      const activity = new Activity({
        title: generatedActivity.title,
        description: generatedActivity.description,
        type,
        difficulty,
        childId,
        therapistId: req.user?.role === 'terapeuta' ? (req.user as any)._id : undefined,
        aiGenerated: true,
        content: {
          text: generatedActivity.content.text,
          instructions: generatedActivity.content.instructions,
          expectedDuration: generatedActivity.content.expectedDuration
        },
        tags: generatedActivity.tags
      });

      // Generar audio si se solicita
      if (generateAudio) {
        try {
          const audioResponse = await TTSService.synthesizeSpeechForChild(
            generatedActivity.content.text,
            child.age
          );
          activity.content.audioUrl = audioResponse.audioUrl;
        } catch (audioError) {
          console.error('Error generando audio:', audioError);
        }
      }

      await activity.save();
      savedActivities.push(activity);
    }

    res.status(201).json({
      message: `${savedActivities.length} actividades generadas exitosamente`,
      activities: savedActivities
    });
  } catch (error) {
    console.error('Error generando múltiples actividades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.json({
      activities: [
        {
          id: 'demo-activity',
          title: 'Cuento de la R',
          description: 'Practicar la R con un cuento',
          type: 'cuento',
          difficulty: 'medio',
          childId: 'demo-child-1',
          therapistId: 'demo-therapist',
          aiGenerated: false,
          content: {
            text: 'Había una rana...',
            instructions: 'Leer en voz alta',
            expectedDuration: 10
          },
          tags: ['cuento', 'R'],
          isActive: true,
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
    const {
      childId,
      type,
      difficulty,
      aiGenerated,
      completed,
      page = 1,
      limit = 10
    } = req.query;

    const filter: any = { isActive: true };
    
    if (childId) filter.childId = childId;
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (aiGenerated !== undefined) filter.aiGenerated = aiGenerated === 'true';
    if (completed !== undefined) filter['progress.completed'] = completed === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const activities = await Activity.find(filter)
      .populate('childId', 'name age')
      .populate('therapistId', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Activity.countDocuments(filter);

    res.json({
      activities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getActivityById = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const { id } = req.params;
    if (id === 'demo-activity') {
      res.json({
        activity: {
          id: 'demo-activity',
          title: 'Cuento de la R',
          description: 'Practicar la R con un cuento',
          type: 'cuento',
          difficulty: 'medio',
          childId: 'demo-child-1',
          therapistId: 'demo-therapist',
          aiGenerated: false,
          content: {
            text: 'Había una rana...',
            instructions: 'Leer en voz alta',
            expectedDuration: 10
          },
          tags: ['cuento', 'R'],
          isActive: true,
          createdAt: new Date().toISOString()
        }
      });
      return;
    } else {
      res.status(404).json({ error: 'Actividad demo no encontrada' });
      return;
    }
  }
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id)
      .populate('childId', 'name age speechGoals')
      .populate('therapistId', 'name');

    if (!activity) {
      res.status(404).json({ error: 'Actividad no encontrada' });
      return;
    }

    res.json({ activity });
  } catch (error) {
    console.error('Error obteniendo actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const updates = req.body;
    res.json({
      message: 'Actividad demo actualizada exitosamente',
      activity: {
        id: req.params.id || 'demo-activity',
        title: updates.title || 'Cuento de la R',
        description: updates.description || 'Practicar la R con un cuento',
        type: updates.type || 'cuento',
        difficulty: updates.difficulty || 'medio',
        childId: updates.childId || 'demo-child-1',
        therapistId: 'demo-therapist',
        aiGenerated: false,
        content: updates.content || {
          text: 'Había una rana...',
          instructions: 'Leer en voz alta',
          expectedDuration: 10
        },
        tags: updates.tags || ['cuento', 'R'],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });
    return;
  }
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verificar que la actividad existe
    const activity = await Activity.findById(id);
    if (!activity) {
      res.status(404).json({ error: 'Actividad no encontrada' });
      return;
    }

    // Verificar permisos (solo el terapeuta que la creó puede editarla)
    if (req.user?.role === 'terapeuta' && activity.therapistId?.toString() !== (req.user as any)._id?.toString()) {
      res.status(403).json({ error: 'No tienes permisos para editar esta actividad' });
      return;
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('childId', 'name age');

    res.json({
      message: 'Actividad actualizada exitosamente',
      activity: updatedActivity
    });
  } catch (error) {
    console.error('Error actualizando actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateActivityProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const { score, timeSpent, feedback } = req.body;
    res.json({
      message: 'Progreso de actividad demo actualizado exitosamente',
      activity: {
        id: req.params.id || 'demo-activity',
        progress: {
          completed: true,
          score: score || 100,
          timeSpent: timeSpent || 10,
          completedAt: new Date().toISOString(),
          feedback: feedback || '¡Excelente!'
        }
      }
    });
    return;
  }
  try {
    const { id } = req.params;
    const { score, timeSpent, feedback } = req.body;

    const activity = await Activity.findById(id);
    if (!activity) {
      res.status(404).json({ error: 'Actividad no encontrada' });
      return;
    }

    // Actualizar progreso
    activity.progress = {
      completed: true,
      score: score || activity.progress.score,
      timeSpent: timeSpent || activity.progress.timeSpent,
      completedAt: new Date(),
      feedback: feedback || activity.progress.feedback
    };

    await activity.save();

    res.json({
      message: 'Progreso de actividad actualizado exitosamente',
      activity
    });
  } catch (error) {
    console.error('Error actualizando progreso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const generateAudioForActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.json({
      message: 'Audio demo generado exitosamente',
      audioUrl: 'https://demo/audio.mp3',
      duration: 5
    });
    return;
  }
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id).populate('childId', 'name age');
    if (!activity) {
      res.status(404).json({ error: 'Actividad no encontrada' });
      return;
    }

    // Generar audio para el contenido de la actividad
    const audioResponse = await TTSService.synthesizeSpeechForChild(
      activity.content.text,
      (activity.childId as any).age
    );

    // Actualizar la actividad con la URL del audio
    activity.content.audioUrl = audioResponse.audioUrl;
    await activity.save();

    res.json({
      message: 'Audio generado exitosamente',
      audioUrl: audioResponse.audioUrl,
      duration: audioResponse.duration
    });
  } catch (error) {
    console.error('Error generando audio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.json({ message: 'Actividad demo eliminada exitosamente' });
    return;
  }
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      res.status(404).json({ error: 'Actividad no encontrada' });
      return;
    }

    // Verificar permisos
    if (req.user?.role === 'terapeuta' && activity.therapistId?.toString() !== (req.user as any)._id?.toString()) {
      res.status(403).json({ error: 'No tienes permisos para eliminar esta actividad' });
      return;
    }

    // Eliminar archivo de audio si existe
    if (activity.content.audioUrl) {
      const fileName = activity.content.audioUrl.split('/').pop();
      if (fileName) {
        await TTSService.deleteAudioFile(fileName);
      }
    }

    await Activity.findByIdAndDelete(id);

    res.json({ message: 'Actividad eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
