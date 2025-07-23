import React, { useState } from 'react';
import './App.css';
import { FaBrain, FaChartLine, FaBookOpen, FaHeart, FaStar, FaUsers, FaBars, FaTimes } from 'react-icons/fa';
import { MdAccessibility, MdPsychology } from 'react-icons/md';
import ActivityGenerator from './components/ActivityGenerator';
import ProgressPanel from './components/ProgressPanel';
import ResourceLibrary from './components/ResourceLibrary';

type ActiveModule = 'home' | 'generator' | 'progress' | 'library';

function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderModule = () => {
    switch (activeModule) {
      case 'generator':
        return <ActivityGenerator />;
      case 'progress':
        return <ProgressPanel />;
      case 'library':
        return <ResourceLibrary />;
      default:
        return (
          <div className="home-content">
            {/* Hero Section */}
            <section className="hero-section">
              <div className="hero-background">
                <div className="floating-shapes">
                  <div className="shape shape-1"></div>
                  <div className="shape shape-2"></div>
                  <div className="shape shape-3"></div>
                  <div className="shape shape-4"></div>
                </div>
              </div>
              
              <div className="hero-content">
                <div className="logo-container">
                  <div className="logo-circle">
                    <FaHeart className="logo-icon" />
                  </div>
                </div>
                
                <h1 className="hero-title">
                  <span className="title-main">SpeechDown</span>
                  <span className="title-subtitle">Terapia del Habla con IA</span>
                </h1>
                
                <p className="hero-description">
                  Desarrollo de una Aplicación Web Responsive con IA Generativa para el Apoyo Terapéutico del Habla en Niños con Síndrome de Down
                </p>
                
                <div className="hero-stats">
                  <div className="stat-item">
                    <FaUsers className="stat-icon" />
                    <span className="stat-number">100%</span>
                    <span className="stat-label">Accesible</span>
                  </div>
                  <div className="stat-item">
                    <MdPsychology className="stat-icon" />
                    <span className="stat-number">IA</span>
                    <span className="stat-label">Generativa</span>
                  </div>
                  <div className="stat-item">
                    <MdAccessibility className="stat-icon" />
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">Soporte</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Objective Section */}
            <section className="objective-section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">
                    <FaStar className="title-icon" />
                    Nuestro Objetivo
                  </h2>
                  <div className="title-underline"></div>
                </div>
                
                <div className="objective-card">
                  <div className="objective-content">
                    <p className="objective-text">
                      Diseñar e implementar una aplicación web responsive que integre APIs de inteligencia artificial generativa para crear herramientas interactivas que apoyen el desarrollo del habla en niños con Síndrome de Down, abordando desafíos específicos en el contexto latinoamericano.
                    </p>
                  </div>
                  <div className="objective-decoration">
                    <div className="decoration-circle"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Description Section */}
            <section className="description-section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">
                    <FaBrain className="title-icon" />
                    Descripción de la Actividad
                  </h2>
                  <div className="title-underline"></div>
                </div>
                
                <div className="features-grid">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <MdAccessibility />
                    </div>
                    <h3>Interfaz Adaptativa</h3>
                    <p>Iconografía intuitiva, soporte para lectores de pantalla y diseño inclusivo para todos los usuarios.</p>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      <FaBrain />
                    </div>
                    <h3>IA Generativa</h3>
                    <p>Prompts especializados para contextos terapéuticos con validación cultural y pertinencia educativa.</p>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      <FaHeart />
                    </div>
                    <h3>Contexto Latinoamericano</h3>
                    <p>Adaptado específicamente para abordar los desafíos y necesidades del contexto latinoamericano.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Modules Section */}
            <section className="modules-section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">
                    <FaStar className="title-icon" />
                    Módulos Interactivos
                  </h2>
                  <div className="title-underline"></div>
                </div>
                
                <div className="modules-grid">
                  <div className="module-card module-1" onClick={() => setActiveModule('generator')}>
                    <div className="module-header">
                      <div className="module-icon-container">
                        <FaBrain className="module-icon" />
                      </div>
                      <h3>Generador de Actividades</h3>
                    </div>
                    <div className="module-content">
                      <p>Crea juegos y ejercicios personalizados en tiempo real usando IA generativa.</p>
                      <ul className="module-features">
                        <li>Prompts terapéuticos especializados</li>
                        <li>Actividades adaptadas por edad</li>
                        <li>Generación en tiempo real</li>
                      </ul>
                    </div>
                    <div className="module-footer">
                      <span className="module-tag">IA Generativa</span>
                    </div>
                  </div>

                  <div className="module-card module-2" onClick={() => setActiveModule('progress')}>
                    <div className="module-header">
                      <div className="module-icon-container">
                        <FaChartLine className="module-icon" />
                      </div>
                      <h3>Panel de Progreso</h3>
                    </div>
                    <div className="module-content">
                      <p>Visualiza la evolución del habla con gráficos interactivos y métricas detalladas.</p>
                      <ul className="module-features">
                        <li>Gráficos de evolución</li>
                        <li>Métricas personalizadas</li>
                        <li>Seguimiento continuo</li>
                      </ul>
                    </div>
                    <div className="module-footer">
                      <span className="module-tag">Analytics</span>
                    </div>
                  </div>

                  <div className="module-card module-3" onClick={() => setActiveModule('library')}>
                    <div className="module-header">
                      <div className="module-icon-container">
                        <FaBookOpen className="module-icon" />
                      </div>
                      <h3>Biblioteca de Recursos</h3>
                    </div>
                    <div className="module-content">
                      <p>Descarga ejercicios y materiales creados por IA para reforzar el aprendizaje.</p>
                      <ul className="module-features">
                        <li>Recursos descargables</li>
                        <li>Materiales personalizados</li>
                        <li>Biblioteca organizada</li>
                      </ul>
                    </div>
                    <div className="module-footer">
                      <span className="module-tag">Recursos</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="main-footer">
              <div className="container">
                <div className="footer-content">
                  <div className="footer-section">
                    <h4>SpeechDown</h4>
                    <p>Apoyo terapéutico del habla con tecnología de vanguardia</p>
                  </div>
                  <div className="footer-section">
                    <h4>Características</h4>
                    <ul>
                      <li>Accesibilidad Total</li>
                      <li>IA Generativa</li>
                      <li>Contexto Latinoamericano</li>
                    </ul>
                  </div>
                  <div className="footer-section">
                    <h4>Contacto</h4>
                    <p>Proyecto Académico</p>
                    <p>© 2024 SpeechDown</p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => setActiveModule('home')}>
            <FaHeart className="brand-icon" />
            <span className="brand-text">SpeechDown</span>
          </div>
          
          <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <button
              className={`nav-item ${activeModule === 'home' ? 'active' : ''}`}
              onClick={() => {
                setActiveModule('home');
                setIsMobileMenuOpen(false);
              }}
            >
              <FaHeart />
              Inicio
            </button>
            <button
              className={`nav-item ${activeModule === 'generator' ? 'active' : ''}`}
              onClick={() => {
                setActiveModule('generator');
                setIsMobileMenuOpen(false);
              }}
            >
              <FaBrain />
              Generador
            </button>
            <button
              className={`nav-item ${activeModule === 'progress' ? 'active' : ''}`}
              onClick={() => {
                setActiveModule('progress');
                setIsMobileMenuOpen(false);
              }}
            >
              <FaChartLine />
              Progreso
            </button>
            <button
              className={`nav-item ${activeModule === 'library' ? 'active' : ''}`}
              onClick={() => {
                setActiveModule('library');
                setIsMobileMenuOpen(false);
              }}
            >
              <FaBookOpen />
              Biblioteca
            </button>
          </div>
          
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {renderModule()}
      </main>
    </div>
  );
}

export default App;
