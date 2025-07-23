import { useState } from 'react';
import { generateActivity } from '../services/api';

const IAForm = () => {
  const [word, setWord] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await generateActivity(word);
      setResponse(result);
    } catch (error) {
      console.error(error);
      setResponse('Ocurrió un error al generar la actividad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-3">
        <label className="form-label">Palabra clave:</label>
        <input
          className="form-control"
          value={word}
          onChange={(e) => setWord(e.target.value)}
        />
        <button className="btn btn-primary mt-2" type="submit" disabled={loading}>
          {loading ? 'Generando...' : 'Generar Actividad'}
        </button>
      </form>

      {response && (
        <div className="alert alert-success">
          <strong>Resultado:</strong><br />{response}
        </div>
      )}
    </div>
  );
};

export default IAForm;
