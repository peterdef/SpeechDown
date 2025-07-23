# SpeechDown - Backend de Terapia del Habla con IA

Una aplicación web full-stack para terapia del habla que utiliza inteligencia artificial para generar ejercicios personalizados y servicios de texto a voz para retroalimentación auditiva.

## 🚀 Características Principales

### 🤖 Integración con IA
- **OpenAI GPT-4** para generar ejercicios personalizados
- Creación de cuentos interactivos
- Juegos de palabras y trabalenguas
- Ejercicios de articulación específicos
- Actividades de fluidez y comprensión

### 🎵 Text-to-Speech
- **Google Cloud Text-to-Speech** para retroalimentación auditiva
- Voces adaptadas por edad del niño
- Personalización de velocidad y tono
- Generación automática de audio para actividades

### 👥 Gestión de Usuarios
- Sistema de autenticación JWT
- Roles diferenciados (Terapeutas y Padres)
- Perfiles de niños con objetivos de terapia
- Asignación de terapeutas a niños

### 📊 Seguimiento de Progreso
- Métricas detalladas de avance
- Análisis de progreso con IA
- Reportes personalizados
- Gráficos de tendencias

### 🛡️ Seguridad
- Autenticación y autorización robusta
- Validación de datos con express-validator
- Rate limiting y protección CORS
- Encriptación de contraseñas

## 🏗️ Arquitectura

```
src/
├── config/          # Configuración de base de datos
├── controllers/     # Controladores de la API
├── middlewares/     # Middlewares de autenticación y validación
├── models/          # Modelos de MongoDB
├── routes/          # Definición de rutas
├── services/        # Servicios de IA y TTS
├── utils/           # Utilidades
├── app.ts           # Configuración de Express
└── index.ts         # Punto de entrada
```

## 📋 Requisitos Previos

- Node.js 18+ 
- MongoDB 5+
- Cuenta de OpenAI (API Key)
- Cuenta de Google Cloud (para Text-to-Speech)

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd arquitectura-backend-speechdown
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
```

Editar `.env` con tus credenciales:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/speechdown
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=tu-gemini-api-key-aqui
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

4. **Iniciar MongoDB**
```bash
# Asegúrate de que MongoDB esté corriendo
mongod
```

5. **Ejecutar la aplicación**
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📚 Endpoints de la API (Local)

La URL base en local es:

```
http://localhost:3000
```

### Usuarios

#### Registrar usuario
```http
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "name": "Alisson",
  "email": "alisson@email.com",
  "password": "12345678",
  "role": "padre",
  "phone": "123456789"
}
```

#### Login
```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "alisson@email.com",
  "password": "12345678"
}
```

#### Obtener perfil actual
```http
GET http://localhost:3000/api/users/me
```

#### Actualizar usuario
```http
PUT http://localhost:3000/api/users/me
Content-Type: application/json

{
  "name": "Nuevo Nombre",
  "phone": "987654321",
  "currentPassword": "12345678",
  "newPassword": "nuevaClave"
}
```

#### Desactivar usuario
```http
DELETE http://localhost:3000/api/users/me
```

#### Listar usuarios
```http
GET http://localhost:3000/api/users
```

#### Obtener usuario por ID
```http
GET http://localhost:3000/api/users/:id
```

---

### Niños

#### Crear niño
```http
POST http://localhost:3000/api/children
Content-Type: application/json

{
  "name": "Pedro",
  "age": 6,
  "gender": "masculino",
  "speechGoals": ["mejorar pronunciación de R"],
  "currentLevel": "inicial",
  "diagnosis": "dislalia",
  "notes": "Le cuesta la R"
}
```

#### Listar niños
```http
GET http://localhost:3000/api/children
```

#### Obtener niño por ID
```http
GET http://localhost:3000/api/children/:id
```

#### Actualizar niño
```http
PUT http://localhost:3000/api/children/:id
Content-Type: application/json

{
  "name": "Pedro Actualizado",
  "age": 7,
  "notes": "Mejorando"
}
```

#### Asignar terapeuta
```http
POST http://localhost:3000/api/children/:id/assign-therapist
Content-Type: application/json

{
  "therapistId": "ID_DEL_TERAPEUTA"
}
```

#### Obtener estadísticas
```http
GET http://localhost:3000/api/children/:id/stats
```

---

### Actividades

#### Crear actividad manual
```http
POST http://localhost:3000/api/activities
Content-Type: application/json

{
  "title": "Cuento de la R",
  "description": "Practicar la R con un cuento",
  "type": "cuento",
  "difficulty": "medio",
  "childId": "ID_DEL_NIÑO",
  "content": {
    "text": "Había una rana...",
    "instructions": "Leer en voz alta",
    "expectedDuration": 10
  },
  "tags": ["cuento", "R"]
}
```

#### Generar actividad con IA
```http
POST http://localhost:3000/api/activities/generate-ai
Content-Type: application/json

{
  "childId": "ID_DEL_NIÑO",
  "type": "cuento",
  "difficulty": "medio",
  "theme": "animales del bosque",
  "generateAudio": true
}
```

#### Listar actividades
```http
GET http://localhost:3000/api/activities
```

#### Obtener actividad por ID
```http
GET http://localhost:3000/api/activities/:id
```

#### Actualizar actividad
```http
PUT http://localhost:3000/api/activities/:id
Content-Type: application/json

{
  "title": "Nuevo título",
  "difficulty": "alta"
}
```

#### Actualizar progreso de actividad
```http
PUT http://localhost:3000/api/activities/:id/progress
Content-Type: application/json

{
  "score": 90,
  "timeSpent": 12,
  "feedback": "Muy bien"
}
```

#### Generar audio para actividad
```http
POST http://localhost:3000/api/activities/:id/generate-audio
```

#### Eliminar actividad
```http
DELETE http://localhost:3000/api/activities/:id
```

---

### Progreso

#### Crear progreso
```http
POST http://localhost:3000/api/progress
Content-Type: application/json

{
  "childId": "ID_DEL_NIÑO",
  "metrics": {
    "activitiesCompleted": 3,
    "totalTimeSpent": 45,
    "averageScore": 85
  },
  "goals": {
    "targetActivities": 5,
    "targetTime": 60,
    "targetScore": 80
  },
  "notes": "Buen avance"
}
```

#### Listar progreso
```http
GET http://localhost:3000/api/progress
```

#### Obtener progreso por ID
```http
GET http://localhost:3000/api/progress/:id
```

#### Actualizar progreso
```http
PUT http://localhost:3000/api/progress/:id
Content-Type: application/json

{
  "metrics": {
    "activitiesCompleted": 4
  },
  "notes": "Mejoró"
}
```

#### Resumen de progreso de un niño
```http
GET http://localhost:3000/api/progress/child/:childId/summary
```

#### Generar reporte de progreso
```http
GET http://localhost:3000/api/progress/report
Content-Type: application/json

{
  "childId": "ID_DEL_NIÑO",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

---

### Salud

#### Verificar salud de la API
```http
GET http://localhost:3000/api/health
```

### 🌐 Ejemplos de uso

#### Registrar usuario
```http
POST https://arquitectura-backend-speechdown-36zi6do6x.vercel.app/api/users/register
Content-Type: application/json

{
  "name": "Juan",
  "email": "juan@email.com",
  "password": "12345678",
  "role": "padre"
}
```

#### Iniciar sesión
```http
POST https://arquitectura-backend-speechdown-36zi6do6x.vercel.app/api/users/login
Content-Type: application/json

{
  "email": "juan@email.com",
  "password": "12345678"
}
```

#### Ver salud de la API
```http
GET https://arquitectura-backend-speechdown-36zi6do6x.vercel.app/api/health
```

#### Listar niños (requiere token JWT)
```http
GET https://arquitectura-backend-speechdown-36zi6do6x.vercel.app/api/children
Authorization: Bearer TU_TOKEN_JWT
```

#### Crear actividad con IA (requiere token JWT)
```http
POST https://arquitectura-backend-speechdown-36zi6do6x.vercel.app/api/activities/generate-ai
Authorization: Bearer TU_TOKEN_JWT
Content-Type: application/json

{
  "childId": "ID_DEL_NIÑO",
  "type": "cuento",
  "difficulty": "medio",
  "theme": "animales del bosque"
}
```

> Cambia la URL base si tu proyecto tiene otra URL en Vercel.

## 🔧 Configuración de Servicios

### Gemini AI (Google)
1. Crea tu cuenta y proyecto en [Google AI Studio](https://aistudio.google.com/) o la consola de Google Cloud.
2. Obtén tu API Key de Gemini.
3. Configura en `.env`:
```env
GEMINI_API_KEY=tu-gemini-api-key-aqui
```

### Google Cloud Text-to-Speech
1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Habilitar Text-to-Speech API
3. Crear credenciales de servicio
4. Descargar archivo JSON de credenciales
5. Configurar en `.env`:
```env
GOOGLE_APPLICATION_CREDENTIALS=./path/to/credentials.json
```

## 🧪 Ejemplos de Uso

### Generar Actividad con IA
```bash
curl -X POST http://localhost:3000/api/activities/generate-ai \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "child_id_here",
    "type": "cuento",
    "difficulty": "medio",
    "theme": "animales del bosque",
    "generateAudio": true
  }'
```

### Registrar Progreso
```bash
curl -X POST http://localhost:3000/api/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "child_id_here",
    "metrics": {
      "activitiesCompleted": 3,
      "totalTimeSpent": 45,
      "averageScore": 85
    },
    "goals": {
      "targetActivities": 5,
      "targetTime": 60,
      "targetScore": 80
    }
  }'
```

## 🚀 Despliegue

### Heroku
```bash
# Configurar variables de entorno en Heroku
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set OPENAI_API_KEY=your-openai-key

# Desplegar
git push heroku main
```

### Docker
```bash
# Construir imagen
docker build -t speechdown-backend .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env speechdown-backend
```

## 📊 Monitoreo y Logs

La aplicación incluye:
- Logging automático de requests
- Métricas de rendimiento
- Manejo de errores centralizado
- Health check endpoint

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

## 🔮 Roadmap

- [ ] Integración con Google Gemini
- [ ] Reconocimiento de voz
- [ ] Aplicación móvil
- [ ] Dashboard en tiempo real
- [ ] Integración con sistemas de salud
- [ ] Machine Learning para personalización avanzada 