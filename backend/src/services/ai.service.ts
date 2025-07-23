import dotenv from 'dotenv';

dotenv.config();

// Gemini API Key
const geminiApiKey = process.env.GEMINI_API_KEY;

// Aquí deberías implementar la integración real con Gemini AI
// Por ahora, se deja como un placeholder para que completes con la librería oficial o fetch

export interface ActivityGenerationParams {
  childName: string;
  age: number;
  type: 'cuento' | 'juego_palabras' | 'articulacion' | 'fluidez' | 'comprension';
  difficulty: 'facil' | 'medio' | 'dificil';
  speechGoals: string[];
  theme?: string;
}

export interface GeneratedActivity {
  title: string;
  description: string;
  content: {
    text: string;
    instructions: string;
    expectedDuration: number;
  };
  tags: string[];
}

export class AIService {
  private static getSystemPrompt(): string {
    return `Eres un especialista en terapia del habla y lenguaje para niños. Tu tarea es crear ejercicios personalizados, divertidos y educativos que ayuden a mejorar las habilidades de comunicación.

Instrucciones importantes:
- Adapta el contenido a la edad del niño
- Usa un lenguaje claro y apropiado para la edad
- Incluye elementos interactivos y motivadores
- Enfócate en los objetivos específicos de terapia
- Mantén un tono positivo y alentador
- Las actividades deben ser entre 5-15 minutos de duración

Tipos de actividades:
- cuento: Historias interactivas con elementos de participación
- juego_palabras: Juegos de vocabulario, rimas, trabalenguas
- articulacion: Ejercicios específicos para sonidos problemáticos
- fluidez: Actividades para mejorar la fluidez del habla
- comprension: Ejercicios de comprensión auditiva y verbal`;
  }

  private static getActivityPrompt(params: ActivityGenerationParams): string {
    const { childName, age, type, difficulty, speechGoals, theme } = params;
    
    let prompt = `Crea una actividad de terapia del habla para ${childName}, un niño de ${age} años.

Tipo de actividad: ${type}
Dificultad: ${difficulty}
Objetivos de terapia: ${speechGoals.join(', ')}
${theme ? `Tema sugerido: ${theme}` : ''}

Por favor genera una actividad que incluya:
1. Un título atractivo
2. Una descripción clara del ejercicio
3. El contenido principal (texto del cuento, palabras para el juego, etc.)
4. Instrucciones paso a paso para realizar la actividad
5. Duración estimada en minutos
6. Etiquetas relevantes

Responde en formato JSON con la siguiente estructura:
{
  "title": "Título de la actividad",
  "description": "Descripción del ejercicio",
  "content": {
    "text": "Contenido principal de la actividad",
    "instructions": "Instrucciones detalladas",
    "expectedDuration": 10
  },
  "tags": ["tag1", "tag2", "tag3"]
}`;

    return prompt;
  }

  static async generateActivity(params: ActivityGenerationParams): Promise<GeneratedActivity> {
    try {
      const systemPrompt = this.getSystemPrompt();
      const activityPrompt = this.getActivityPrompt(params);

      // Aquí deberías llamar a la API de Gemini usando fetch o la librería oficial
      // Ejemplo de placeholder:
      const response = await fetch('https://api.gemini.google.com/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${geminiApiKey}`
        },
        body: JSON.stringify({
          prompt: activityPrompt,
          // ...otros parámetros según la API de Gemini
        })
      });
      const data: any = await response.json();
      // Ajusta el parsing según la respuesta real de Gemini
      if (!data || typeof data !== 'object' || !('result' in data) || typeof (data as any).result !== 'string') {
        throw new Error('No se recibió respuesta de Gemini');
      }
      // Intentar parsear la respuesta JSON
      try {
        const parsedResponse = JSON.parse((data as any).result);
        return {
          title: parsedResponse.title,
          description: parsedResponse.description,
          content: {
            text: String((data as any).result),
            instructions: "Lee el contenido y sigue las instrucciones del terapeuta",
            expectedDuration: 10
          },
          tags: [params.type, params.difficulty, 'personalizado']
        };
      } catch (parseError) {
        // Si falla el parsing JSON, crear una actividad básica
        return {
          title: `Actividad de ${params.type} para ${params.childName}`,
          description: `Ejercicio personalizado de ${params.type} adaptado para ${params.childName}`,
          content: {
            text: data.result,
            instructions: "Lee el contenido y sigue las instrucciones del terapeuta",
            expectedDuration: 10
          },
          tags: [params.type, params.difficulty, 'personalizado']
        };
      }
    } catch (error) {
      console.error('Error generando actividad con Gemini:', error);
      throw new Error('Error al generar actividad con Gemini');
    }
  }

  static async generateMultipleActivities(
    params: ActivityGenerationParams,
    count: number = 3
  ): Promise<GeneratedActivity[]> {
    const activities: GeneratedActivity[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const activity = await this.generateActivity(params);
        activities.push(activity);
      } catch (error) {
        console.error(`Error generando actividad ${i + 1}:`, error);
      }
    }
    
    return activities;
  }

  static async analyzeProgress(activitiesData: any[]): Promise<string> {
    try {
      const prompt = `Analiza los siguientes datos de actividades de terapia del habla y proporciona un resumen del progreso:

${JSON.stringify(activitiesData, null, 2)}

Proporciona:
1. Resumen del progreso general
2. Áreas de mejora identificadas
3. Recomendaciones para próximas sesiones
4. Observaciones importantes

Responde en un formato claro y profesional.`;

      // Aquí deberías llamar a la API de Gemini usando fetch o la librería oficial
      // Ejemplo de placeholder:
      const response = await fetch('https://api.gemini.google.com/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${geminiApiKey}`
        },
        body: JSON.stringify({
          prompt: prompt,
          // ...otros parámetros según la API de Gemini
        })
      });
      const data: any = await response.json();
      // Ajusta el parsing según la respuesta real de Gemini
      if (!data || typeof data !== 'object' || !('result' in data) || typeof (data as any).result !== 'string') {
        return 'No se pudo analizar el progreso';
      }
      return (data as any).result;
    } catch (error) {
      console.error('Error analizando progreso:', error);
      return 'Error al analizar el progreso';
    }
  }
}
