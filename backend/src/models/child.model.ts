import mongoose, { Document, Schema } from 'mongoose';

export interface IChild extends Document {
  name: string;
  age: number;
  gender: 'masculino' | 'femenino' | 'otro';
  parentId: mongoose.Types.ObjectId;
  therapistId?: mongoose.Types.ObjectId;
  speechGoals: string[];
  currentLevel: 'inicial' | 'intermedio' | 'avanzado';
  diagnosis?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const childSchema = new Schema<IChild>({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  age: {
    type: Number,
    required: [true, 'La edad es obligatoria'],
    min: [0, 'La edad no puede ser negativa'],
    max: [18, 'La edad no puede ser mayor a 18 años']
  },
  gender: {
    type: String,
    enum: ['masculino', 'femenino', 'otro'],
    required: [true, 'El género es obligatorio']
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El padre es obligatorio']
  },
  therapistId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  speechGoals: [{
    type: String,
    trim: true
  }],
  currentLevel: {
    type: String,
    enum: ['inicial', 'intermedio', 'avanzado'],
    default: 'inicial'
  },
  diagnosis: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento de las consultas
childSchema.index({ parentId: 1 });
childSchema.index({ therapistId: 1 });
childSchema.index({ isActive: 1 });

export const Child = mongoose.model<IChild>('Child', childSchema); 