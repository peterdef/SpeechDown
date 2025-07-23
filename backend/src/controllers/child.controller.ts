import { Request, Response } from 'express';
import { Child, IChild } from '../models/child.model';
import { User } from '../models/user.model';

interface AuthRequest extends Request {
  user?: any;
}

export const createChild = async (req: AuthRequest, res: Response): Promise<void> => {
  // Si no hay autenticación, permitir crear un niño demo
  if (!req.user) {
    const { name, age, gender, speechGoals, currentLevel = 'inicial', diagnosis, notes } = req.body;
    res.status(201).json({
      message: 'Perfil de niño demo creado exitosamente',
      child: {
        id: 'demo-child',
        name,
        age,
        gender,
        speechGoals,
        currentLevel,
        diagnosis,
        notes,
        parentId: 'demo-parent',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });
    return;
  }
  try {
    const {
      name,
      age,
      gender,
      speechGoals,
      currentLevel = 'inicial',
      diagnosis,
      notes
    } = req.body;

    // Verificar que el usuario autenticado es un padre
    if (req.user?.role !== 'padre') {
      res.status(403).json({ error: 'Solo los padres pueden crear perfiles de niños' });
      return;
    }

    const child = new Child({
      name,
      age,
      gender,
      parentId: (req.user as any)._id,
      speechGoals,
      currentLevel,
      diagnosis,
      notes
    });

    await child.save();

    res.status(201).json({
      message: 'Perfil de niño creado exitosamente',
      child
    });
  } catch (error) {
    console.error('Error creando perfil de niño:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getChildren = async (req: AuthRequest, res: Response): Promise<void> => {
  // Si no hay autenticación, devolver una lista de niños demo
  if (!req.user) {
    res.json({
      children: [
        {
          id: 'demo-child-1',
          name: 'Pedro',
          age: 6,
          gender: 'masculino',
          speechGoals: ['mejorar pronunciación de R'],
          currentLevel: 'inicial',
          diagnosis: 'dislalia',
          notes: 'Le cuesta la R',
          parentId: 'demo-parent',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-child-2',
          name: 'Lucía',
          age: 5,
          gender: 'femenino',
          speechGoals: ['mejorar fluidez'],
          currentLevel: 'intermedio',
          diagnosis: 'disfemia',
          notes: 'Tartamudez leve',
          parentId: 'demo-parent',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1
      }
    });
    return;
  }
  try {
    const { page = 1, limit = 10, isActive = true } = req.query;
    
    let filter: any = { isActive: isActive === 'true' };

    // Si es un padre, solo mostrar sus hijos
    if (req.user?.role === 'padre') {
      filter.parentId = (req.user as any)._id;
    }
    // Si es un terapeuta, mostrar niños asignados o todos si no hay filtro
    else if (req.user?.role === 'terapeuta') {
      // Por defecto mostrar todos, pero se puede filtrar por terapeuta asignado
      if (req.query.assignedToMe === 'true') {
        filter.therapistId = (req.user as any)._id;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const children = await Child.find(filter)
      .populate('parentId', 'name email')
      .populate('therapistId', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Child.countDocuments(filter);

    res.json({
      children,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo niños:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getChildById = async (req: AuthRequest, res: Response): Promise<void> => {
  // Si no hay autenticación, devolver un niño demo si el id es demo-child-1 o demo-child-2
  if (!req.user) {
    const { id } = req.params;
    if (id === 'demo-child-1') {
      res.json({
        child: {
          id: 'demo-child-1',
          name: 'Pedro',
          age: 6,
          gender: 'masculino',
          speechGoals: ['mejorar pronunciación de R'],
          currentLevel: 'inicial',
          diagnosis: 'dislalia',
          notes: 'Le cuesta la R',
          parentId: 'demo-parent',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      });
      return;
    } else if (id === 'demo-child-2') {
      res.json({
        child: {
          id: 'demo-child-2',
          name: 'Lucía',
          age: 5,
          gender: 'femenino',
          speechGoals: ['mejorar fluidez'],
          currentLevel: 'intermedio',
          diagnosis: 'disfemia',
          notes: 'Tartamudez leve',
          parentId: 'demo-parent',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      });
      return;
    } else {
      res.status(404).json({ error: 'Niño demo no encontrado' });
      return;
    }
  }
  try {
    const { id } = req.params;

    const child = await Child.findById(id)
      .populate('parentId', 'name email phone')
      .populate('therapistId', 'name email phone');

    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    res.json({ child });
  } catch (error) {
    console.error('Error obteniendo niño:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateChild = async (req: AuthRequest, res: Response): Promise<void> => {
  // Si no hay autenticación, devolver un niño demo actualizado
  if (!req.user) {
    const updates = req.body;
    res.json({
      message: 'Perfil de niño demo actualizado exitosamente',
      child: {
        id: req.params.id || 'demo-child',
        name: updates.name || 'Pedro',
        age: updates.age || 6,
        gender: updates.gender || 'masculino',
        speechGoals: updates.speechGoals || ['mejorar pronunciación de R'],
        currentLevel: updates.currentLevel || 'inicial',
        diagnosis: updates.diagnosis || 'dislalia',
        notes: updates.notes || 'Le cuesta la R',
        parentId: 'demo-parent',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });
    return;
  }
  try {
    const { id } = req.params;
    const updates = req.body;

    const child = await Child.findById(id);
    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    // Verificar permisos
    if (req.user?.role === 'padre' && child.parentId.toString() !== (req.user as any)._id.toString()) {
      res.status(403).json({ error: 'No tienes permisos para editar este perfil' });
      return;
    }

    // Si es un terapeuta, solo puede actualizar ciertos campos
    if (req.user?.role === 'terapeuta') {
      const allowedUpdates = ['currentLevel', 'diagnosis', 'notes', 'speechGoals'];
      const filteredUpdates: any = {};
      
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      // Asignar terapeuta si no está asignado
      if (!child.therapistId) {
        filteredUpdates.therapistId = (req.user as any)._id;
      }

      const updatedChild = await Child.findByIdAndUpdate(
        id,
        filteredUpdates,
        { new: true, runValidators: true }
      ).populate('parentId', 'name email')
       .populate('therapistId', 'name email');

      res.json({
        message: 'Perfil de niño actualizado exitosamente',
        child: updatedChild
      });
    } else {
      // Los padres pueden actualizar todos los campos excepto therapistId
      delete updates.therapistId;
      
      const updatedChild = await Child.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).populate('parentId', 'name email')
       .populate('therapistId', 'name email');

      res.json({
        message: 'Perfil de niño actualizado exitosamente',
        child: updatedChild
      });
    }
  } catch (error) {
    console.error('Error actualizando niño:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const assignTherapist = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.json({
      message: 'Terapeuta demo asignado exitosamente',
      child: {
        id: req.params.id || 'demo-child',
        therapistId: req.body.therapistId || 'demo-therapist',
        updatedAt: new Date().toISOString()
      }
    });
    return;
  }
  try {
    const { id } = req.params;
    const { therapistId } = req.body;

    // Verificar que el niño existe
    const child = await Child.findById(id);
    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    // Verificar que el terapeuta existe y es un terapeuta
    const therapist = await User.findById(therapistId);
    if (!therapist || therapist.role !== 'terapeuta') {
      res.status(404).json({ error: 'Terapeuta no encontrado' });
      return;
    }

    // Verificar permisos (solo el padre puede asignar terapeuta)
    if (req.user?.role === 'padre' && child.parentId.toString() !== (req.user as any)._id.toString()) {
      res.status(403).json({ error: 'No tienes permisos para asignar terapeuta' });
      return;
    }

    child.therapistId = therapistId;
    await child.save();

    const updatedChild = await Child.findById(id)
      .populate('parentId', 'name email')
      .populate('therapistId', 'name email');

    res.json({
      message: 'Terapeuta asignado exitosamente',
      child: updatedChild
    });
  } catch (error) {
    console.error('Error asignando terapeuta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const removeTherapist = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.json({
      message: 'Terapeuta demo removido exitosamente',
      child: {
        id: req.params.id || 'demo-child',
        therapistId: null,
        updatedAt: new Date().toISOString()
      }
    });
    return;
  }
  try {
    const { id } = req.params;

    const child = await Child.findById(id);
    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    // Verificar permisos (solo el padre puede remover terapeuta)
    if (req.user?.role === 'padre' && child.parentId.toString() !== (req.user as any)._id.toString()) {
      res.status(403).json({ error: 'No tienes permisos para remover terapeuta' });
      return;
    }

    child.therapistId = undefined;
    await child.save();

    const updatedChild = await Child.findById(id)
      .populate('parentId', 'name email')
      .populate('therapistId', 'name email');

    res.json({
      message: 'Terapeuta removido exitosamente',
      child: updatedChild
    });
  } catch (error) {
    console.error('Error removiendo terapeuta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deactivateChild = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.json({
      message: 'Perfil de niño demo desactivado exitosamente',
      child: {
        id: req.params.id || 'demo-child',
        isActive: false,
        updatedAt: new Date().toISOString()
      }
    });
    return;
  }
  try {
    const { id } = req.params;

    const child = await Child.findById(id);
    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    // Verificar permisos (solo el padre puede desactivar)
    if (req.user?.role === 'padre' && child.parentId.toString() !== (req.user as any)._id.toString()) {
      res.status(403).json({ error: 'No tienes permisos para desactivar este perfil' });
      return;
    }

    child.isActive = false;
    await child.save();

    res.json({
      message: 'Perfil de niño desactivado exitosamente',
      child
    });
  } catch (error) {
    console.error('Error desactivando niño:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getChildStats = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.json({
      stats: {
        totalActivities: 5,
        completedActivities: 4,
        averageScore: 90,
        totalTimeSpent: 120
      }
    });
    return;
  }
  try {
    const { id } = req.params;

    const child = await Child.findById(id);
    if (!child) {
      res.status(404).json({ error: 'Niño no encontrado' });
      return;
    }

    // Aquí se pueden agregar estadísticas del niño
    // Por ejemplo, número de actividades completadas, progreso promedio, etc.
    // Por ahora retornamos información básica

    const stats = {
      childId: child._id,
      childName: child.name,
      age: child.age,
      currentLevel: child.currentLevel,
      speechGoals: child.speechGoals,
      therapistAssigned: !!child.therapistId,
      profileCreated: child.createdAt,
      lastUpdated: child.updatedAt
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error obteniendo estadísticas del niño:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
