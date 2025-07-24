import React, { useState, useRef } from 'react';
import { FaBrain, FaPlay, FaDownload, FaSpinner, FaMagic, FaChild, FaBook } from 'react-icons/fa';
import { MdAccessibility, MdPsychology } from 'react-icons/md';
import './ActivityGenerator.css';
import { generateGeminiContent } from '../services/api';

interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'game' | 'exercise' | 'story';
  difficulty: 'easy' | 'medium' | 'hard';
  ageGroup: '3-5' | '6-8' | '9-12';
  content: string;
  createdAt: string; // string ISO
}

interface ActivityGeneratorProps {
  childId: string;
}

const ActivityGenerator: React.FC<ActivityGeneratorProps> = ({ childId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedWord, setSelectedWord] = useState('');
  const [selectedType, setSelectedType] = useState<'game' | 'exercise' | 'story'>('game');
  const [selectedAge, setSelectedAge] = useState<'3-5' | '6-8' | '9-12'>('6-8');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [error, setError] = useState<string | null>(null);

  // Palabras predefinidas para el contexto latinoamericano
  const commonWords = [
    'perro', 'gato', 'casa', 'mamá', 'papá', 'sol', 'luna', 'agua', 'pan', 'leche',
    'árbol', 'flor', 'coche', 'libro', 'pelota', 'amigo', 'familia', 'escuela'
  ];

  const generateActivity = async () => {
    if (!selectedWord.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      // Llama directamente a Gemini desde el frontend
      const aiData = await generateGeminiContent({
        word: selectedWord,
        type: selectedType,
        age: selectedAge,
        difficulty: selectedDifficulty
      });
      const newActivity: Activity = {
        id: aiData.id || Date.now().toString(),
        title: aiData.title || `Actividad con "${selectedWord}"`,
        description: aiData.description || generateActivityDescription(selectedWord, selectedType, selectedAge, selectedDifficulty),
        type: selectedType,
        difficulty: selectedDifficulty,
        ageGroup: selectedAge,
        content: aiData.content || '',
        createdAt: new Date().toISOString() // string ISO
      };
      setActivities(prev => [newActivity, ...prev]);
      setIsGenerating(false);
    } catch (err) {
      setIsGenerating(false);
      setError('Error generando actividad con IA.');
    }
  };

  const generateActivityDescription = (word: string, type: string, age: string, difficulty: string) => {
    const descriptions = {
      game: `Juego interactivo para practicar la palabra "${word}" de manera divertida`,
      exercise: `Ejercicio terapéutico enfocado en la pronunciación de "${word}"`,
      story: `Historia corta que incluye la palabra "${word}" para mejorar la comprensión`
    };
    return descriptions[type as keyof typeof descriptions];
  };

  const generateActivityContent = (word: string, type: string, age: string, difficulty: string) => {
    const templates = {
      game: `🎮 JUEGO: "Encuentra ${word}"
      
1. Dibuja o imprime imágenes de ${word}
2. Esconde las imágenes en la habitación
3. El niño debe encontrar todas las imágenes
4. Cada vez que encuentre una, debe decir "${word}" claramente
5. ¡Celebra cada acierto con aplausos!`,
      
      exercise: `💪 EJERCICIO: "Repite conmigo"
      
1. Siéntate frente al niño
2. Di "${word}" lentamente, sílaba por sílaba
3. Pide al niño que repita después de ti
4. Usa gestos para acompañar cada sílaba
5. Repite 5 veces, aumentando la velocidad gradualmente`,
      
      story: `📖 HISTORIA: "El ${word} especial"
      
Había una vez un ${word} muy especial que vivía en un lugar mágico. Este ${word} tenía amigos muy divertidos y juntos pasaban días increíbles. Un día, el ${word} decidió hacer algo muy importante para ayudar a todos sus amigos. ¿Qué crees que hizo el ${word}?`
    };
    
    return templates[type as keyof typeof templates];
  };

  const downloadActivity = (activity: Activity) => {
    // Descargar el texto limpio y completo
    const content = `
TÍTULO: ${activity.title}
DESCRIPCIÓN: ${activity.description}
EDAD: ${activity.ageGroup} años
DIFICULTAD: ${activity.difficulty}
TIPO: ${activity.type}

${typeof activity.content === 'string' ? activity.content : JSON.stringify(activity.content, null, 2)}

Generado por SpeechDown - ${new Date(activity.createdAt).toLocaleDateString()}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actividad-${activity.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Añadir función para leer en voz alta con pausa/reanudar
  const synthRef = useRef(window.speechSynthesis);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  function speak(text: string) {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  }

  function pauseSpeech() {
    if (synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }

  function resumeSpeech() {
    if (synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }

  // Utilidad para limpiar texto de símbolos, emojis y markdown
  function cleanText(text: string) {
    return text
      .replace(/\*\*/g, '') // quitar asteriscos markdown
      .replace(/[:;=8][\-o\*\']?[\)\(\[\]dDpP\/\\OpP]/gi, '') // quitar caritas/emojis simples
      .replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // quitar emojis unicode
      .replace(/[•\-\*\_\#\>\`\[\]\{\}\|]/g, '') // quitar otros símbolos
      .replace(/\s{2,}/g, ' ') // espacios dobles
      .replace(/\n+/g, ' ') // saltos de línea
      .trim();
  }

  // Procesar el contenido para mostrarlo como cuento real
  function renderStoryContent(content: any) {
    if (Array.isArray(content)) {
      return (
        <div className="story-content">
          {content.map((step: any, idx: number) => (
            <p key={idx} style={{ marginBottom: 8 }}>
              {step.instruction ? cleanText(step.instruction) : ''}
              {step.action ? ' ' + cleanText(step.action) : ''}
            </p>
          ))}
        </div>
      );
    }
    // Si es string plano
    return <p className="story-content">{cleanText(content)}</p>;
  }

  // Obtener texto plano para la voz
  function getPlainTextForSpeech(content: any) {
    if (Array.isArray(content)) {
      return content.map((step: any) => `${step.instruction ? cleanText(step.instruction) : ''} ${step.action ? cleanText(step.action) : ''}`).join(' ');
    }
    return typeof content === 'string' ? cleanText(content) : '';
  }

  // Añadir función para obtener imagen de Unsplash
  function getUnsplashImageUrl(word: string) {
    // Unsplash permite hotlinking para pruebas, pero en producción deberías usar su API oficial
    return `https://source.unsplash.com/400x250/?${encodeURIComponent(word)}`;
  }

  return (
    <div className="activity-generator">
      <div className="generator-header">
        <div className="header-icon">
          <FaBrain className="brain-icon" />
        </div>
        <h2>Generador de Actividades con IA</h2>
        <p>Crea actividades personalizadas para el desarrollo del habla</p>
      </div>

      <div className="generator-controls">
        <div className="control-group">
          <label>Palabra Clave:</label>
          <div className="word-input-container">
            <input
              type="text"
              value={selectedWord}
              onChange={(e) => setSelectedWord(e.target.value)}
              placeholder="Escribe una palabra (ej: perro)"
              className="word-input"
            />
            <div className="suggested-words">
              {commonWords.slice(0, 6).map(word => (
                <button
                  key={word}
                  onClick={() => setSelectedWord(word)}
                  className={`word-chip ${selectedWord === word ? 'active' : ''}`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>Tipo de Actividad:</label>
            <div className="type-buttons">
              {[
                { value: 'game', label: 'Juego', icon: FaPlay },
                { value: 'exercise', label: 'Ejercicio', icon: FaChild },
                { value: 'story', label: 'Historia', icon: FaBook }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedType(value as any)}
                  className={`type-button ${selectedType === value ? 'active' : ''}`}
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>Grupo de Edad:</label>
            <div className="age-buttons">
              {['3-5', '6-8', '9-12'].map(age => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age as any)}
                  className={`age-button ${selectedAge === age ? 'active' : ''}`}
                >
                  {age} años
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>Dificultad:</label>
            <div className="difficulty-buttons">
              {[
                { value: 'easy', label: 'Fácil', color: '#4ade80' },
                { value: 'medium', label: 'Medio', color: '#fbbf24' },
                { value: 'hard', label: 'Difícil', color: '#f87171' }
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setSelectedDifficulty(value as any)}
                  className={`difficulty-button ${selectedDifficulty === value ? 'active' : ''}`}
                  style={{ '--difficulty-color': color } as any}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={generateActivity}
          disabled={isGenerating || !selectedWord.trim()}
          className="generate-button"
        >
          {isGenerating ? (
            <>
              <FaSpinner className="spinner" />
              Generando...
            </>
          ) : (
            <>
              <FaMagic />
              Generar Actividad
            </>
          )}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="activities-list">
        <h3>Actividades Generadas</h3>
        {activities.length === 0 ? (
          <div className="empty-state">
            <FaBrain className="empty-icon" />
            <p>No hay actividades generadas aún</p>
            <p>¡Usa el generador para crear tu primera actividad!</p>
          </div>
        ) : (
          <div className="activities-grid">
            {activities.map(activity => (
              <div key={activity.id} className="activity-card">
                <div className="activity-header">
                  <div className="activity-type-badge">
                    {activity.type === 'game' && <FaPlay />}
                    {activity.type === 'exercise' && <FaChild />}
                    {activity.type === 'story' && <FaBook />}
                    {activity.type}
                  </div>
                  <div className="activity-meta">
                    <span className="age-badge">{activity.ageGroup} años</span>
                    <span className={`difficulty-badge difficulty-${activity.difficulty}`}>
                      {activity.difficulty}
                    </span>
                  </div>
                </div>
                
                <h4>{activity.title}</h4>
                <p className="activity-description">{activity.description}</p>
                
                <div className="activity-content">
                  {/* Imagen ilustrativa */}
                  <img
                    src={getUnsplashImageUrl(activity.title.split(' ')[activity.title.split(' ').length - 1] || activity.ageGroup)}
                    alt={activity.title}
                    className="activity-image"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                  />
                  {renderStoryContent(activity.content)}
                </div>
                
                <div className="activity-footer">
                  <span className="activity-date">
                    {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : ''}
                  </span>
                  {!isSpeaking ? (
                    <button
                      onClick={() => speak(getPlainTextForSpeech(activity.content))}
                      className="tts-button"
                      style={{ marginRight: 8 }}
                    >
                      🔊 Escuchar
                    </button>
                  ) : isPaused ? (
                    <button
                      onClick={resumeSpeech}
                      className="tts-button"
                      style={{ marginRight: 8 }}
                    >
                      ▶️ Reanudar
                    </button>
                  ) : (
                    <button
                      onClick={pauseSpeech}
                      className="tts-button"
                      style={{ marginRight: 8 }}
                    >
                      ⏸️ Pausar
                    </button>
                  )}
                  <button
                    onClick={() => downloadActivity(activity)}
                    className="download-button"
                  >
                    <FaDownload />
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityGenerator; 