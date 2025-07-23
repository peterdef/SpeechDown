import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import './AuthPage.css';

interface AuthPageProps {
  onAuthSuccess: (user: { name: string; email: string }) => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (mode === 'register' && name.trim().length < 2) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Correo electrónico inválido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === 'login') {
        setSuccess('¡Bienvenido de nuevo!');
        onAuthSuccess({ name: name || 'Usuario', email });
      } else {
        setSuccess('¡Registro exitoso!');
        onAuthSuccess({ name, email });
      }
    }, 1200);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          >
            <FaSignInAlt /> Iniciar sesión
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
          >
            <FaUserPlus /> Registrarse
          </button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus={mode === 'login'}
            />
          </div>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
        </form>
        <button className="auth-back" onClick={onBack}>
          Volver a inicio
        </button>
      </div>
    </div>
  );
};

export default AuthPage; 