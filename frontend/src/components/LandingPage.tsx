import React from 'react';
import { FaHeart } from 'react-icons/fa';
import './LandingPage.css';

const LandingPage: React.FC<{ onAuth: () => void }> = ({ onAuth }) => (
  <div className="landing-page">
    <div className="landing-content">
      <div className="landing-logo">
        <FaHeart className="landing-logo-icon" />
      </div>
      <h1 className="landing-title">SpeechDown</h1>
      <p className="landing-slogan">Apoyo terapéutico del habla con IA para niños con Síndrome de Down</p>
      <button className="landing-auth-btn" onClick={onAuth}>
        Iniciar sesión / Registrarse
      </button>
    </div>
  </div>
);

export default LandingPage; 