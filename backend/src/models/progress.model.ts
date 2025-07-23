import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  childId: mongoose.Types.ObjectId;
  date: Date;
  metrics: {
    activitiesCompleted: number;
    totalTimeSpent: number; // en minutos
    averageScore: number;
    fluencyScore?: number;
    articulationScore?: number;
    comprehensionScore?: number;
  };
  goals: {
    targetActivities: number;
    targetTime: number; // en minutos
    targetScore: number;
    achieved: boolean;
  };
  notes?: string;
  therapistId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>({
  childId: {
    type: Schema.Types.ObjectId,
    ref: 'Child',
    required: [true, 'El niño es obligatorio']
  },
  date: {
    type: Date,
    required: [true, 'La fecha es obligatoria'],
    default: Date.now
  },
  metrics: {
    activitiesCompleted: {
      type: Number,
      required: [true, 'El número de actividades completadas es obligatorio'],
      min: [0, 'No puede ser negativo']
    },
    totalTimeSpent: {
      type: Number,
      required: [true, 'El tiempo total es obligatorio'],
      min: [0, 'No puede ser negativo']
    },
    averageScore: {
      type: Number,
      required: [true, 'El puntaje promedio es obligatorio'],
      min: [0, 'No puede ser menor a 0'],
      max: [100, 'No puede ser mayor a 100']
    },
    fluencyScore: {
      type: Number,
      min: [0, 'No puede ser menor a 0'],
      max: [100, 'No puede ser mayor a 100']
    },
    articulationScore: {
      type: Number,
      min: [0, 'No puede ser menor a 0'],
      max: [100, 'No puede ser mayor a 100']
    },
    comprehensionScore: {
      type: Number,
      min: [0, 'No puede ser menor a 0'],
      max: [100, 'No puede ser mayor a 100']
    }
  },
  goals: {
    targetActivities: {
      type: Number,
      required: [true, 'El objetivo de actividades es obligatorio'],
      min: [1, 'Debe ser al menos 1']
    },
    targetTime: {
      type: Number,
      required: [true, 'El objetivo de tiempo es obligatorio'],
      min: [1, 'Debe ser al menos 1 minuto']
    },
    targetScore: {
      type: Number,
      required: [true, 'El objetivo de puntaje es obligatorio'],
      min: [0, 'No puede ser menor a 0'],
      max: [100, 'No puede ser mayor a 100']
    },
    achieved: {
      type: Boolean,
      default: false
    }
  },
  notes: {
    type: String,
    trim: true
  },
  therapistId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
progressSchema.index({ childId: 1, date: -1 });
progressSchema.index({ date: 1 });
progressSchema.index({ 'goals.achieved': 1 });

export const Progress = mongoose.model<IProgress>('Progress', progressSchema); 