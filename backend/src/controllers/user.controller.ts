import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/user.model';

interface AuthRequest extends Request {
  user?: IUser;
}

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'El email ya está registrado' });
      return;
    }

    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      password,
      role,
      phone
    });

    await user.save();

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    // Enviar respuesta sin contraseña
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      res.status(401).json({ error: 'Usuario inactivo' });
      return;
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    // Enviar respuesta sin contraseña
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Inicio de sesión exitoso',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  // Si no hay autenticación, devolver un usuario de ejemplo
  if (!req.user) {
    res.json({
      user: {
        id: "demo",
        name: "Usuario Demo",
        email: "demo@email.com",
        role: "demo",
        phone: "000000000",
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });
    return;
  }

  const userResponse = {
    id: (req.user as any)._id.toString(),
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    phone: req.user.phone,
    isActive: req.user.isActive,
    createdAt: req.user.createdAt
  };

  res.json({ user: userResponse });
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  // Si no hay autenticación, devolver un usuario demo actualizado
  if (!req.user) {
    const { name, phone, newPassword } = req.body;
    res.json({
      message: 'Usuario demo actualizado exitosamente',
      user: {
        id: "demo",
        name: name || "Usuario Demo",
        email: "demo@email.com",
        role: "demo",
        phone: phone || "000000000",
        isActive: true,
        createdAt: new Date().toISOString(),
        ...(newPassword && { password: newPassword })
      }
    });
    return;
  }
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { name, phone, currentPassword, newPassword } = req.body;
    const updates: any = {};

    // Actualizar campos básicos
    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    // Si se quiere cambiar la contraseña
    if (currentPassword && newPassword) {
      const isValidPassword = await req.user.comparePassword(currentPassword);
      if (!isValidPassword) {
        res.status(400).json({ error: 'Contraseña actual incorrecta' });
        return;
      }
      updates.password = newPassword;
    }

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      (req.user as any)._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const userResponse = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt
    };

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: userResponse
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deactivateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  // Si no hay autenticación, devolver un usuario demo desactivado
  if (!req.user) {
    res.json({
      message: 'Usuario demo desactivado exitosamente',
      user: {
        id: "demo",
        name: "Usuario Demo",
        email: "demo@email.com",
        role: "demo",
        phone: "000000000",
        isActive: false,
        createdAt: new Date().toISOString()
      }
    });
    return;
  }
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      (req.user as any)._id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      message: 'Usuario desactivado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error desactivando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
