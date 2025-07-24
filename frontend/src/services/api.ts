// src/services/api.ts

const API_URL = 'http://localhost:3000/api'; // Cambia el puerto si tu backend usa otro

// --- AUTENTICACIÓN Y USUARIOS ---
export async function registerUser(data: { name: string; email: string; password: string; role: 'padre' | 'terapeuta' }) {
  const res = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al registrar usuario');
  return res.json();
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al iniciar sesión');
  return res.json();
}

export async function getCurrentUser(token: string) {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('No autenticado');
  return res.json();
}

// --- NIÑOS ---
export async function createChild(data: any, token: string) {
  const res = await fetch(`${API_URL}/children`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear perfil de niño');
  return res.json();
}

export async function getChildren(token: string) {
  const res = await fetch(`${API_URL}/children`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener niños');
  return res.json();
}

// --- ACTIVIDADES ---
export async function generateActivityWithAI(data: { word: string; type: string; age: string; difficulty: string; childId: string }, token: string) {
  const res = await fetch(`${API_URL}/activities/generate-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al generar actividad con IA');
  return res.json();
}

export async function getActivities(token: string) {
  const res = await fetch(`${API_URL}/activities`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener actividades');
  return res.json();
}

export async function updateActivityProgress(activityId: string, progress: any, token: string) {
  const res = await fetch(`${API_URL}/activities/${activityId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(progress)
  });
  if (!res.ok) throw new Error('Error al actualizar progreso');
  return res.json();
}

export async function generateAudioForActivity(activityId: string, token: string) {
  const res = await fetch(`${API_URL}/activities/${activityId}/generate-audio`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al generar audio');
  return res.blob(); // Devuelve el audio como blob
}

// --- PROGRESO ---
export async function getProgress(token: string) {
  const res = await fetch(`${API_URL}/progress`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener progreso');
  return res.json();
}

export async function createProgress(data: any, token: string) {
  const res = await fetch(`${API_URL}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear progreso');
  return res.json();
}

// --- RECURSOS (opcional, si el backend lo soporta) ---
// Puedes agregar aquí funciones para recursos si tienes endpoints específicos

// --- GEMINI DIRECTO DESDE EL FRONTEND ---
export async function generateGeminiContent(data: { word: string; type: string; age: string; difficulty: string }) {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  // Construir el prompt terapéutico mejorado para textos largos
  const prompt = `Genera un texto largo, detallado y amigable para niños, en formato de cuento o actividad, según el tipo: ${data.type}. El texto debe tener al menos 500 palabras y estar dirigido a un niño de ${data.age} años con síndrome de Down, nivel de dificultad ${data.difficulty}, usando la palabra "${data.word}" de forma repetida y creativa. Usa frases simples, positivas y amigables. Devuelve un JSON con las claves: title, description, content. El campo content debe ser un texto largo, sin símbolos ni formato markdown, solo texto plano.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GEMINI_API_KEY
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Error al consultar Gemini');
  const result = await res.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    return JSON.parse(text);
  } catch {
    return { title: 'Actividad generada', description: '', content: text };
  }
}
