import { Link } from 'react-router-dom';

const Header = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
    <div className="container">
      <Link className="navbar-brand" to="/">SpeechDown</Link>
      <div>
        <Link className="nav-link d-inline" to="/activities">Actividades</Link>
        <Link className="nav-link d-inline" to="/progress">Progreso</Link>
      </div>
    </div>
  </nav>
);

export default Header;
