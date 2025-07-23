import React, { useState, useEffect } from 'react';
import { FaChartLine, FaTrophy, FaCalendar, FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { MdAccessibility, MdPsychology } from 'react-icons/md';
import './ProgressPanel.css';

interface ProgressData {
  date: string;
  pronunciation: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  category: 'pronunciation' | 'vocabulary' | 'fluency' | 'confidence';
}

const ProgressPanel: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>('');

  // Datos simulados de progreso
  useEffect(() => {
    const generateProgressData = () => {
      const data: ProgressData[] = [];
      const periods = {
        week: 7,
        month: 30,
        quarter: 90
      };
      
      const days = periods[selectedPeriod];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          pronunciation: Math.floor(Math.random() * 30) + 70,
          vocabulary: Math.floor(Math.random() * 25) + 75,
          fluency: Math.floor(Math.random() * 35) + 65,
          confidence: Math.floor(Math.random() * 40) + 60
        });
      }
      
      setProgressData(data);
    };

    generateProgressData();
  }, [selectedPeriod]);

  // Metas simuladas
  useEffect(() => {
    const mockGoals: Goal[] = [
      {
        id: '1',
        title: 'Pronunciar 50 palabras nuevas',
        target: 50,
        current: 32,
        unit: 'palabras',
        deadline: '2024-02-15',
        category: 'pronunciation'
      },
      {
        id: '2',
        title: 'Aumentar vocabulario en 30%',
        target: 30,
        current: 18,
        unit: '%',
        deadline: '2024-03-01',
        category: 'vocabulary'
      },
      {
        id: '3',
        title: 'Mejorar fluidez en conversaciones',
        target: 80,
        current: 65,
        unit: 'puntos',
        deadline: '2024-02-28',
        category: 'fluency'
      },
      {
        id: '4',
        title: 'Ganar confianza en público',
        target: 90,
        current: 72,
        unit: 'puntos',
        deadline: '2024-03-15',
        category: 'confidence'
      }
    ];
    
    setGoals(mockGoals);
  }, []);

  const getAverageProgress = (category: keyof Omit<ProgressData, 'date'>) => {
    if (progressData.length === 0) return 0;
    const sum = progressData.reduce((acc, data) => acc + data[category], 0);
    return Math.round(sum / progressData.length);
  };

  const getProgressTrend = (category: keyof Omit<ProgressData, 'date'>) => {
    if (progressData.length < 2) return 'stable';
    const recent = progressData.slice(-7);
    const older = progressData.slice(-14, -7);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((acc, data) => acc + data[category], 0) / recent.length;
    const olderAvg = older.reduce((acc, data) => acc + data[category], 0) / older.length;
    
    return recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable';
  };

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      pronunciation: '#667eea',
      vocabulary: '#764ba2',
      fluency: '#f093fb',
      confidence: '#feca57'
    };
    return colors[category as keyof typeof colors] || '#667eea';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      pronunciation: FaStar,
      vocabulary: MdPsychology,
      fluency: FaArrowUp,
      confidence: FaStar
    };
    return icons[category as keyof typeof icons] || FaStar;
  };

  return (
    <div className="progress-panel">
      <div className="panel-header">
        <div className="header-icon">
          <FaChartLine className="chart-icon" />
        </div>
        <h2>Panel de Progreso</h2>
        <p>Seguimiento del desarrollo del habla y logros</p>
      </div>

      {/* Filtros de período */}
      <div className="period-filters">
        <button
          onClick={() => setSelectedPeriod('week')}
          className={`period-button ${selectedPeriod === 'week' ? 'active' : ''}`}
        >
          <FaCalendar />
          Semana
        </button>
        <button
          onClick={() => setSelectedPeriod('month')}
          className={`period-button ${selectedPeriod === 'month' ? 'active' : ''}`}
        >
          <FaCalendar />
          Mes
        </button>
        <button
          onClick={() => setSelectedPeriod('quarter')}
          className={`period-button ${selectedPeriod === 'quarter' ? 'active' : ''}`}
        >
          <FaCalendar />
          Trimestre
        </button>
      </div>

      {/* Métricas principales */}
      <div className="metrics-grid">
                 <div className="metric-card">
           <div className="metric-header">
             <FaStar className="metric-icon" style={{ color: getCategoryColor('pronunciation') }} />
             <div className="metric-trend">
               {getProgressTrend('pronunciation') === 'up' && <FaArrowUp className="trend-up" />}
               {getProgressTrend('pronunciation') === 'down' && <FaArrowDown className="trend-down" />}
             </div>
           </div>
          <h3>Pronunciación</h3>
          <div className="metric-value">{getAverageProgress('pronunciation')}%</div>
          <div className="metric-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${getAverageProgress('pronunciation')}%`,
                backgroundColor: getCategoryColor('pronunciation')
              }}
            ></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <MdPsychology className="metric-icon" style={{ color: getCategoryColor('vocabulary') }} /> {/* Changed from FaBook to MdPsychology */}
                         <div className="metric-trend">
               {getProgressTrend('vocabulary') === 'up' && <FaArrowUp className="trend-up" />}
               {getProgressTrend('vocabulary') === 'down' && <FaArrowDown className="trend-down" />}
             </div>
          </div>
          <h3>Vocabulario</h3>
          <div className="metric-value">{getAverageProgress('vocabulary')}%</div>
          <div className="metric-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${getAverageProgress('vocabulary')}%`,
                backgroundColor: getCategoryColor('vocabulary')
              }}
            ></div>
          </div>
        </div>

                 <div className="metric-card">
           <div className="metric-header">
             <FaArrowUp className="metric-icon" style={{ color: getCategoryColor('fluency') }} />
             <div className="metric-trend">
               {getProgressTrend('fluency') === 'up' && <FaArrowUp className="trend-up" />}
               {getProgressTrend('fluency') === 'down' && <FaArrowDown className="trend-down" />}
             </div>
           </div>
           <h3>Fluidez</h3>
           <div className="metric-value">{getAverageProgress('fluency')}%</div>
           <div className="metric-progress">
             <div 
               className="progress-bar" 
               style={{ 
                 width: `${getAverageProgress('fluency')}%`,
                 backgroundColor: getCategoryColor('fluency')
               }}
             ></div>
           </div>
         </div>

         <div className="metric-card">
           <div className="metric-header">
             <FaStar className="metric-icon" style={{ color: getCategoryColor('confidence') }} />
             <div className="metric-trend">
               {getProgressTrend('confidence') === 'up' && <FaArrowUp className="trend-up" />}
               {getProgressTrend('confidence') === 'down' && <FaArrowDown className="trend-down" />}
             </div>
           </div>
          <h3>Confianza</h3>
          <div className="metric-value">{getAverageProgress('confidence')}%</div>
          <div className="metric-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${getAverageProgress('confidence')}%`,
                backgroundColor: getCategoryColor('confidence')
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Gráfico de progreso */}
      <div className="chart-section">
        <h3>Evolución del Progreso</h3>
        <div className="chart-container">
          <div className="chart-labels">
            <div className="chart-label">100%</div>
            <div className="chart-label">75%</div>
            <div className="chart-label">50%</div>
            <div className="chart-label">25%</div>
            <div className="chart-label">0%</div>
          </div>
          <div className="chart-grid">
            {progressData.slice(-10).map((data, index) => (
              <div key={data.date} className="chart-column">
                <div className="chart-bar pronunciation" style={{ height: `${data.pronunciation}%` }}></div>
                <div className="chart-bar vocabulary" style={{ height: `${data.vocabulary}%` }}></div>
                <div className="chart-bar fluency" style={{ height: `${data.fluency}%` }}></div>
                <div className="chart-bar confidence" style={{ height: `${data.confidence}%` }}></div>
                <div className="chart-date">
                  {new Date(data.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color pronunciation"></div>
            <span>Pronunciación</span>
          </div>
          <div className="legend-item">
            <div className="legend-color vocabulary"></div>
            <span>Vocabulario</span>
          </div>
          <div className="legend-item">
            <div className="legend-color fluency"></div>
            <span>Fluidez</span>
          </div>
          <div className="legend-item">
            <div className="legend-color confidence"></div>
            <span>Confianza</span>
          </div>
        </div>
      </div>

      {/* Metas y objetivos */}
      <div className="goals-section">
        <h3>Metas y Objetivos</h3>
        <div className="goals-grid">
          {goals.map(goal => {
            const IconComponent = getCategoryIcon(goal.category);
            const progress = getGoalProgress(goal);
            const daysLeft = getDaysUntilDeadline(goal.deadline);
            
            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <IconComponent 
                    className="goal-icon" 
                    style={{ color: getCategoryColor(goal.category) }}
                  />
                  <div className="goal-deadline">
                    {daysLeft > 0 ? `${daysLeft} días` : 'Vencida'}
                  </div>
                </div>
                
                <h4>{goal.title}</h4>
                <div className="goal-progress">
                  <div className="goal-progress-bar">
                    <div 
                      className="goal-progress-fill"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: getCategoryColor(goal.category)
                      }}
                    ></div>
                  </div>
                  <div className="goal-progress-text">
                    {goal.current} / {goal.target} {goal.unit} ({progress}%)
                  </div>
                </div>
                
                <div className="goal-status">
                  {progress >= 100 ? (
                    <div className="status-completed">
                      <FaTrophy />
                      ¡Meta alcanzada!
                    </div>
                  ) : daysLeft < 0 ? (
                    <div className="status-overdue">
                      Meta vencida
                    </div>
                  ) : (
                    <div className="status-in-progress">
                      En progreso
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logros recientes */}
      <div className="achievements-section">
        <h3>Logros Recientes</h3>
        <div className="achievements-grid">
          <div className="achievement-card">
            <FaTrophy className="achievement-icon" />
            <h4>Primera Palabra Completa</h4>
            <p>¡Lograste pronunciar "mamá" perfectamente!</p>
            <span className="achievement-date">Hace 2 días</span>
          </div>
          
          <div className="achievement-card">
            <FaStar className="achievement-icon" />
            <h4>Vocabulario Expandido</h4>
            <p>Añadiste 10 nuevas palabras a tu vocabulario</p>
            <span className="achievement-date">Hace 1 semana</span>
          </div>
          
                     <div className="achievement-card">
             <FaArrowUp className="achievement-icon" />
             <h4>Fluidez Mejorada</h4>
             <p>Tu fluidez aumentó un 15% este mes</p>
             <span className="achievement-date">Hace 2 semanas</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPanel;
