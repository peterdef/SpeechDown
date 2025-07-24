import React, { useState, useEffect } from 'react';
import { FaBookOpen, FaDownload, FaSearch, FaFilter, FaStar, FaEye, FaHeart, FaShare, FaFilePdf, FaFileWord, FaFileImage, FaFileAudio } from 'react-icons/fa';
import { MdAccessibility, MdPsychology } from 'react-icons/md';
import './ResourceLibrary.css';
import { getActivities } from '../services/api';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'ejercicios' | 'historias' | 'juegos' | 'materiales' | 'videos';
  type: 'pdf' | 'word' | 'image' | 'audio' | 'video';
  difficulty: 'easy' | 'medium' | 'hard';
  ageGroup: '3-5' | '6-8' | '9-12';
  downloads: number;
  rating: number;
  views: number;
  favorites: number;
  createdAt: Date;
  tags: string[];
  size: string;
  language: 'español' | 'inglés' | 'portugués';
}

// Datos quemados de ejemplo
const MOCK_RESOURCES = [
  {
    id: 'demo-1',
    title: 'Cuento de la R',
    description: 'Practicar la R con un cuento',
    category: 'historias',
    type: 'pdf',
    difficulty: 'easy',
    ageGroup: '6-8',
    downloads: 12,
    rating: 4.5,
    views: 100,
    favorites: 10,
    createdAt: new Date().toISOString(),
    tags: ['cuento', 'R'],
    size: '1MB',
    language: 'español',
    content: 'Había una vez un ratón llamado Ramón...'
  },
  {
    id: 'demo-2',
    title: 'Juego de Palabras',
    description: 'Juego para aprender palabras nuevas',
    category: 'juegos',
    type: 'pdf',
    difficulty: 'medium',
    ageGroup: '9-12',
    downloads: 8,
    rating: 4.2,
    views: 80,
    favorites: 7,
    createdAt: new Date().toISOString(),
    tags: ['juego', 'palabras'],
    size: '1MB',
    language: 'español',
    content: 'Busca palabras que empiecen con la letra P...'
  }
];

const ResourceLibrary: React.FC = () => {
  // Mostrar recursos generados en tiempo real si existen (usando localStorage como ejemplo simple)
  const [resources, setResources] = useState<any[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'downloads' | 'rating' | 'title'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Datos simulados de recursos
  useEffect(() => {
    // Intentar cargar recursos generados por el usuario
    let generated = [];
    try {
      generated = JSON.parse(localStorage.getItem('generatedActivities') || '[]');
    } catch {
      generated = [];
    }
    // Validar recursos y asegurar que tengan los campos requeridos
    const validResources = Array.isArray(generated)
      ? generated.filter(r => r && r.title && r.description && r.tags && Array.isArray(r.tags))
      : [];
    if (validResources.length > 0) {
      setResources(validResources);
    } else {
      setResources(MOCK_RESOURCES);
    }
  }, []);

  // Filtrado y búsqueda
  useEffect(() => {
    let filtered = resources;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(resource.tags) && resource.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Filtro por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Filtro por dificultad
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(resource => resource.difficulty === selectedDifficulty);
    }

    // Filtro por edad
    if (selectedAge !== 'all') {
      filtered = filtered.filter(resource => resource.ageGroup === selectedAge);
    }

    // Filtro por idioma
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(resource => resource.language === selectedLanguage);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    // Si el filtrado deja el array vacío, mostrar los de ejemplo
    if (filtered.length === 0) {
      setFilteredResources(MOCK_RESOURCES);
    } else {
      setFilteredResources(filtered);
    }
  }, [resources, searchTerm, selectedCategory, selectedDifficulty, selectedAge, selectedLanguage, sortBy]);

  const getTypeIcon = (type: string) => {
    const icons = {
      pdf: FaFilePdf,
      word: FaFileWord,
      image: FaFileImage,
      audio: FaFileAudio,
      video: FaFileAudio
    };
    return icons[type as keyof typeof icons] || FaFilePdf;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      ejercicios: FaBookOpen,
      historias: FaBookOpen,
      juegos: FaHeart,
      materiales: MdAccessibility,
      videos: FaFileAudio
    };
    return icons[category as keyof typeof icons] || FaBookOpen;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: '#48bb78',
      medium: '#ed8936',
      hard: '#f56565'
    };
    return colors[difficulty as keyof typeof colors] || '#48bb78';
  };

  const downloadResource = (resource: Resource) => {
    // Simulación de descarga
    const content = `
RECURSO: ${resource.title}
DESCRIPCIÓN: ${resource.description}
CATEGORÍA: ${resource.category}
DIFICULTAD: ${resource.difficulty}
GRUPO DE EDAD: ${resource.ageGroup}
IDIOMA: ${resource.language}
TAMAÑO: ${resource.size}

TAGS: ${resource.tags.join(', ')}

Descargado desde SpeechDown - ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFavorite = (resourceId: string) => {
    setResources(prev => prev.map(resource =>
      resource.id === resourceId
        ? { ...resource, favorites: resource.favorites + 1 }
        : resource
    ));
  };

  const shareResource = (resource: Resource) => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(`${resource.title} - ${resource.description}`);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <div className="resource-library">
      <div className="library-header">
        <div className="header-icon">
          <FaBookOpen className="book-icon" />
        </div>
        <h2>Biblioteca de Recursos</h2>
        <p>Descarga materiales educativos y terapéuticos creados por IA</p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="search-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Categoría:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas las categorías</option>
              <option value="ejercicios">Ejercicios</option>
              <option value="historias">Historias</option>
              <option value="juegos">Juegos</option>
              <option value="materiales">Materiales</option>
              <option value="videos">Videos</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Dificultad:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas las dificultades</option>
              <option value="easy">Fácil</option>
              <option value="medium">Medio</option>
              <option value="hard">Difícil</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Edad:</label>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas las edades</option>
              <option value="3-5">3-5 años</option>
              <option value="6-8">6-8 años</option>
              <option value="9-12">9-12 años</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Idioma:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos los idiomas</option>
              <option value="español">Español</option>
              <option value="inglés">Inglés</option>
              <option value="portugués">Portugués</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="filter-select"
            >
              <option value="date">Más recientes</option>
              <option value="downloads">Más descargados</option>
              <option value="rating">Mejor valorados</option>
              <option value="title">Alfabético</option>
            </select>
          </div>
        </div>

        <div className="view-toggle">
          <button
            onClick={() => setViewMode('grid')}
            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
          >
            <FaFilter />
            Cuadrícula
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
          >
            <FaFilter />
            Lista
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="library-stats">
        <div className="stat-item">
          <span className="stat-number">{filteredResources.length}</span>
          <span className="stat-label">Recursos encontrados</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{resources.reduce((sum, r) => sum + r.downloads, 0)}</span>
          <span className="stat-label">Total descargas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{resources.length}</span>
          <span className="stat-label">Recursos totales</span>
        </div>
      </div>

      {/* Lista de recursos */}
      <div className={`resources-container ${viewMode}`}>
        {filteredResources.length === 0 ? (
          <div className="empty-state">
            <FaBookOpen className="empty-icon" />
            <h3>No se encontraron recursos</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          filteredResources.map(resource => {
            const TypeIcon = getTypeIcon(resource.type);
            const CategoryIcon = getCategoryIcon(resource.category);
            
            return (
              <div key={resource.id} className="resource-card">
                <div className="resource-header">
                  <div className="resource-type">
                    <TypeIcon className="type-icon" />
                    <span className="type-label">{resource.type.toUpperCase()}</span>
                  </div>
                  <div className="resource-actions">
                    <button
                      onClick={() => toggleFavorite(resource.id)}
                      className="action-button favorite"
                      title="Agregar a favoritos"
                    >
                      <FaHeart />
                      <span>{resource.favorites}</span>
                    </button>
                    <button
                      onClick={() => shareResource(resource)}
                      className="action-button share"
                      title="Compartir"
                    >
                      <FaShare />
                    </button>
                  </div>
                </div>

                <div className="resource-content">
                  <div className="resource-icon">
                    <CategoryIcon />
                  </div>
                  
                  <h3 className="resource-title">{resource.title}</h3>
                  <p className="resource-description">{resource.description}</p>
                  
                  <div className="resource-tags">
                    {resource.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="resource-meta">
                    <div className="meta-item">
                      <span className="meta-label">Dificultad:</span>
                      <span 
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(resource.difficulty) }}
                      >
                        {resource.difficulty}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Edad:</span>
                      <span className="age-badge">{resource.ageGroup} años</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Idioma:</span>
                      <span className="language-badge">{resource.language}</span>
                    </div>
                  </div>
                  
                  <div className="resource-stats">
                    <div className="stat">
                      <FaDownload />
                      <span>{resource.downloads}</span>
                    </div>
                    <div className="stat">
                      <FaStar />
                      <span>{resource.rating}</span>
                    </div>
                    <div className="stat">
                      <FaEye />
                      <span>{resource.views}</span>
                    </div>
                  </div>
                </div>

                <div className="resource-footer">
                  <div className="resource-info">
                    <span className="resource-size">{resource.size}</span>
                    <span className="resource-date">
                      {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => downloadResource(resource)}
                    className="download-button"
                  >
                    <FaDownload />
                    Descargar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ResourceLibrary;
