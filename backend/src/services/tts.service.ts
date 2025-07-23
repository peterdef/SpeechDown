import textToSpeech from '@google-cloud/text-to-speech';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export interface TTSOptions {
  text: string;
  voice?: {
    languageCode?: string;
    name?: string;
    ssmlGender?: 'SSML_VOICE_GENDER_UNSPECIFIED' | 'MALE' | 'FEMALE' | 'NEUTRAL';
  };
  audioConfig?: {
    audioEncoding?: 'LINEAR16' | 'MP3' | 'OGG_OPUS';
    speakingRate?: number;
    pitch?: number;
    volumeGainDb?: number;
  };
}

export interface TTSResponse {
  audioContent: Buffer;
  audioUrl?: string;
  duration?: number;
}

export class TTSService {
  private static readonly AUDIO_DIR = path.join(process.cwd(), 'uploads', 'audio');
  private static readonly SUPPORTED_LANGUAGES = {
    'es-ES': 'Spanish (Spain)',
    'es-MX': 'Spanish (Mexico)',
    'en-US': 'English (US)',
    'en-GB': 'English (UK)'
  };

  private static readonly VOICE_OPTIONS = {
    'es-ES': [
      { name: 'es-ES-Neural2-A', gender: 'FEMALE' },
      { name: 'es-ES-Neural2-B', gender: 'MALE' },
      { name: 'es-ES-Neural2-C', gender: 'FEMALE' },
      { name: 'es-ES-Neural2-D', gender: 'MALE' },
      { name: 'es-ES-Neural2-E', gender: 'FEMALE' }
    ],
    'es-MX': [
      { name: 'es-MX-Neural2-A', gender: 'FEMALE' },
      { name: 'es-MX-Neural2-B', gender: 'MALE' },
      { name: 'es-MX-Neural2-C', gender: 'FEMALE' },
      { name: 'es-MX-Neural2-D', gender: 'MALE' }
    ],
    'en-US': [
      { name: 'en-US-Neural2-A', gender: 'FEMALE' },
      { name: 'en-US-Neural2-B', gender: 'MALE' },
      { name: 'en-US-Neural2-C', gender: 'FEMALE' },
      { name: 'en-US-Neural2-D', gender: 'MALE' },
      { name: 'en-US-Neural2-E', gender: 'FEMALE' },
      { name: 'en-US-Neural2-F', gender: 'MALE' },
      { name: 'en-US-Neural2-G', gender: 'FEMALE' },
      { name: 'en-US-Neural2-H', gender: 'FEMALE' },
      { name: 'en-US-Neural2-I', gender: 'MALE' },
      { name: 'en-US-Neural2-J', gender: 'MALE' }
    ]
  };

  static async synthesizeSpeech(options: TTSOptions): Promise<TTSResponse> {
    try {
      // Configuración por defecto
      const defaultOptions: TTSOptions = {
        text: options.text,
        voice: {
          languageCode: 'es-ES',
          name: 'es-ES-Neural2-A',
          ssmlGender: 'FEMALE',
          ...options.voice
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0,
          ...options.audioConfig
        }
      };

      // Construir la solicitud
      const request = {
        input: { text: defaultOptions.text },
        voice: {
          languageCode: defaultOptions.voice!.languageCode,
          name: defaultOptions.voice!.name,
          ssmlGender: defaultOptions.voice!.ssmlGender
        },
        audioConfig: {
          audioEncoding: defaultOptions.audioConfig!.audioEncoding,
          speakingRate: defaultOptions.audioConfig!.speakingRate,
          pitch: defaultOptions.audioConfig!.pitch,
          volumeGainDb: defaultOptions.audioConfig!.volumeGainDb
        }
      };

      // Realizar la síntesis
      const [response] = await client.synthesizeSpeech(request);
      const audioContent = response.audioContent as Buffer;

      if (!audioContent) {
        throw new Error('No se generó contenido de audio');
      }

      // Guardar el archivo de audio
      const fileName = `audio_${Date.now()}.mp3`;
      const filePath = path.join(this.AUDIO_DIR, fileName);
      
      // Crear directorio si no existe
      await this.ensureAudioDirectory();
      
      await fs.writeFile(filePath, audioContent);

      return {
        audioContent,
        audioUrl: `/uploads/audio/${fileName}`,
        duration: this.estimateDuration(options.text)
      };

    } catch (error) {
      console.error('Error en síntesis de voz:', error);
      throw new Error('Error al generar audio');
    }
  }

  static async synthesizeSpeechForChild(
    text: string,
    childAge: number,
    languageCode: string = 'es-ES'
  ): Promise<TTSResponse> {
    // Configurar voz apropiada para la edad del niño
    let voiceName = 'es-ES-Neural2-A';
    let speakingRate = 1.0;
    let pitch = 0.0;

    if (childAge < 6) {
      // Para niños pequeños, usar voz más lenta y clara
      speakingRate = 0.8;
      pitch = 2.0; // Voz más aguda
    } else if (childAge < 10) {
      // Para niños medianos
      speakingRate = 0.9;
      pitch = 1.0;
    }

    // Seleccionar voz apropiada según el idioma
    const voices = this.VOICE_OPTIONS[languageCode as keyof typeof this.VOICE_OPTIONS];
    if (voices && voices.length > 0) {
      voiceName = voices[0].name;
    }

    return this.synthesizeSpeech({
      text,
      voice: {
        languageCode,
        name: voiceName,
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate,
        pitch,
        volumeGainDb: 2.0 // Aumentar volumen para niños
      }
    });
  }

  static async synthesizeActivityInstructions(
    instructions: string,
    childName: string,
    languageCode: string = 'es-ES'
  ): Promise<TTSResponse> {
    // Personalizar las instrucciones con el nombre del niño
    const personalizedInstructions = instructions.replace(
      /{nombre}/g,
      childName
    );

    return this.synthesizeSpeech({
      text: personalizedInstructions,
      voice: {
        languageCode,
        name: 'es-ES-Neural2-A',
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
        pitch: 0.0,
        volumeGainDb: 1.0
      }
    });
  }

  static async synthesizeFeedback(
    feedback: string,
    isPositive: boolean = true,
    languageCode: string = 'es-ES'
  ): Promise<TTSResponse> {
    // Ajustar el tono según el tipo de feedback
    const pitch = isPositive ? 1.0 : 0.0;
    const speakingRate = isPositive ? 1.1 : 0.9;

    return this.synthesizeSpeech({
      text: feedback,
      voice: {
        languageCode,
        name: 'es-ES-Neural2-A',
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate,
        pitch,
        volumeGainDb: 1.5
      }
    });
  }

  static getSupportedLanguages(): Record<string, string> {
    return this.SUPPORTED_LANGUAGES;
  }

  static getVoiceOptions(languageCode: string): Array<{ name: string; gender: string }> {
    return this.VOICE_OPTIONS[languageCode as keyof typeof this.VOICE_OPTIONS] || [];
  }

  private static async ensureAudioDirectory(): Promise<void> {
    try {
      await fs.access(this.AUDIO_DIR);
    } catch {
      await fs.mkdir(this.AUDIO_DIR, { recursive: true });
    }
  }

  private static estimateDuration(text: string): number {
    // Estimación aproximada: 150 palabras por minuto
    const words = text.split(' ').length;
    return Math.ceil(words / 150 * 60); // Duración en segundos
  }

  static async deleteAudioFile(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.AUDIO_DIR, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error eliminando archivo de audio:', error);
    }
  }
}
