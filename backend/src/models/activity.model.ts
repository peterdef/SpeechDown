import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  type: 'cuento' | 'juego_palabras' | 'articulacion' | 'fluidez' | 'comprension';
  difficulty: 'facil' | 'medio' | 'dificil';
  childId: mongoose.Types.ObjectId;
  therapistId?: mongoose.Types.ObjectId;
  aiGenerated: boolean;
  content: {
    text: string;
    audioUrl?: string;
    instructions: string;
    expectedDuration: number; // en minutos
  };
  progress: {
    completed: boolean;
    score?: number;
    timeSpent?: number; // en segundos
    completedAt?: Date;
    feedback?: string;
  };
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede tener más de 200 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  type: {
    type: String,
    enum: ['cuento', 'juego_palabras', 'articulacion', 'fluidez', 'comprension'],
    required: [true, 'El tipo de actividad es obligatorio']
  },
  difficulty: {
    type: String,
    enum: ['facil', 'medio', 'dificil'],
    required: [true, 'La dificultad es obligatoria']
  },
  childId: {
    type: Schema.Types.ObjectId,
    ref: 'Child',
    required: [true, 'El niño es obligatorio']
  },
  therapistId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  content: {
    text: {
      type: String,
      required: [true, 'El contenido de texto es obligatorio']
    },
    audioUrl: {
      type: String
    },
    instructions: {
      type: String,
      required: [true, 'Las instrucciones son obligatorias']
    },
    expectedDuration: {
      type: Number,
      required: [true, 'La duración esperada es obligatoria'],
      min: [1, 'La duración debe ser al menos 1 minuto']
    }
  },
  progress: {
    completed: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      min: [0, 'El puntaje no puede ser negativo'],
      max: [100, 'El puntaje no puede ser mayor a 100']
    },
    timeSpent: {
      type: Number,
      min: [0, 'El tiempo no puede ser negativo']
    },
    completedAt: {
      type: Date
    },
    feedback: {
      type: String,
      trim: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
activitySchema.index({ childId: 1, isActive: 1 });
activitySchema.index({ type: 1, difficulty: 1 });
activitySchema.index({ aiGenerated: 1 });
activitySchema.index({ 'progress.completed': 1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema); 