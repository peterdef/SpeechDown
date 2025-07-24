import React, { useState } from 'react';
import { createChild } from '../services/api';

interface ChildFormProps {
  onChildCreated: (child: any) => void;
  onCancel?: () => void;
}

const ChildForm: React.FC<ChildFormProps> = ({ onChildCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(6);
  const [gender, setGender] = useState<'masculino' | 'femenino'>('masculino');
  const [speechGoals, setSpeechGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const child = await createChild({
        name,
        age,
        gender,
        speechGoals: speechGoals.split(',').map(g => g.trim())
      }, token);
      onChildCreated(child);
    } catch (err: any) {
      setError(err.message || 'Error al crear niño');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="child-form-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f4f8 0%, #c2e9fb 100%)' }}>
      <form className="child-form" onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 16, padding: '32px 24px', boxShadow: '0 4px 24px #0002', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 8, color: '#2563eb', fontWeight: 700, letterSpacing: 1 }}>Registrar Niño</h2>
        <div className="form-group">
          <label style={{ fontWeight: 500 }}>Nombre:</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required minLength={2} placeholder="Nombre completo" style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db', width: '100%' }} />
        </div>
        <div className="form-group">
          <label style={{ fontWeight: 500 }}>Edad:</label>
          <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} min={1} max={18} required placeholder="Edad" style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db', width: '100%' }} />
        </div>
        <div className="form-group">
          <label style={{ fontWeight: 500 }}>Sexo:</label>
          <select value={gender} onChange={e => setGender(e.target.value as any)} required style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db', width: '100%' }}>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>
        <div className="form-group">
          <label style={{ fontWeight: 500 }}>Metas de habla:</label>
          <input type="text" value={speechGoals} onChange={e => setSpeechGoals(e.target.value)} placeholder="Ej: Mejorar pronunciación de la R" style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db', width: '100%' }} />
        </div>
        {error && <p className="error-message" style={{ color: '#f87171', textAlign: 'center', margin: 0 }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
          <button type="button" onClick={() => onCancel?.()} style={{ background: '#f87171', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', cursor: 'pointer', flex: 1 }}>Volver</button>
          <button type="submit" style={{ background: '#4ade80', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', cursor: 'pointer', flex: 1 }} disabled={loading}>{loading ? 'Guardando...' : 'Registrar'}</button>
        </div>
      </form>
    </div>
  );
};

export default ChildForm; 