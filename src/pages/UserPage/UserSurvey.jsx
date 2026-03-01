import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import './UserSurvey.css';

const UserSurvey = () => {
  const [step, setStep] = useState(1);
  const [columns, setColumns] = useState({ contenu: [], paraverbal: [], corporel: [], support: [] });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Labels pour aider l'utilisateur à se repérer sur le slider
  const getLabel = (val) => {
    if (val === 0) return "Non noté";
    if (val <= 1) return "Passable";
    if (val <= 2) return "Bien";
    if (val <= 3) return "Très Bien";
    return "Excellent";
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: options } = await supabase.from('options').select('*').order('created_at', { ascending: true });
    const { data: studentsData } = await supabase.from('students').select('*').order('created_at', { ascending: true });

    if (options && studentsData) {
      setStudents(studentsData);
      const organized = { contenu: [], paraverbal: [], corporel: [], support: [] };
      
      options.forEach((opt) => {
        if (organized.hasOwnProperty(opt.column_id)) {
          const updatedCriteriaList = opt.criteria_list?.map(crit => ({
            ...crit,
            ratings: opt.is_common ? { common: 0 } : Object.fromEntries(studentsData.map(s => [s.id, 0]))
          })) || [];
          organized[opt.column_id].push({ ...opt, criteria_list: updatedCriteriaList });
        }
      });
      setColumns(organized);
    }
    setLoading(false);
  };

  const totalScore = useMemo(() => {
    let score = 0;
    Object.values(columns).flat().forEach(task => {
      task.criteria_list?.forEach(crit => {
        const pointPerLevel = parseFloat(crit.points || 0) / 4;
        Object.values(crit.ratings).forEach(val => {
          score += (parseFloat(val) * pointPerLevel);
        });
      });
    });
    return score.toFixed(1);
  }, [columns]);

  const updateRating = (columnId, taskId, critIdx, entityId, value) => {
    setColumns(prev => ({
      ...prev,
      [columnId]: prev[columnId].map(t => {
        if (t.id === taskId) {
          const newList = [...t.criteria_list];
          newList[critIdx].ratings = { ...newList[critIdx].ratings, [entityId]: parseFloat(value) };
          return { ...t, criteria_list: newList };
        }
        return t;
      })
    }));
  };

  if (loading) return <div className="loader">Chargement...</div>;

  const progressHeader = (step / 3) * 100;

  return (
    <div className="survey-wrapper">
      <header className="survey-header-fixed">
        <div className="progress-container">
          <div className="progress-bar-top" style={{ width: `${progressHeader}%` }}></div>
        </div>
        <div className="header-content">
          <div className="step-info">Étape {step}/3</div>
          <div className="live-score-badge">Total: <span>{totalScore}</span></div>
        </div>
      </header>

      <div className="survey-main">
        <div className="survey-page fade-in">
          {step === 1 && renderSection("contenu", "📝 Qualité du Contenu")}
          {step === 2 && (
            <>
              {renderSection("paraverbal", "🗣️ Communication Paraverbale")}
              {renderSection("corporel", "🚶 Posture & Corps")}
            </>
          )}
          {step === 3 && renderSection("support", "💻 Support Visuel")}
        </div>
      </div>

      <footer className="survey-footer">
        <div className="footer-btns">
          {step > 1 && <button className="btn-back" onClick={() => setStep(step - 1)}>Retour</button>}
          {step < 3 ? (
            <button className="btn-next" onClick={() => setStep(step + 1)}>Suivant</button>
          ) : (
            <button className="btn-finish" onClick={() => alert("Évaluation sauvegardée !")}>Enregistrer</button>
          )}
        </div>
      </footer>
    </div>
  );

  function renderSection(colId, title) {
    return (
      <div className="section-block">
        <h2 className="page-title">{title}</h2>
        {columns[colId].map(task => (
          <div key={task.id} className="survey-card">
            <h3 className="card-title">{task.title}</h3>
            {task.criteria_list?.map((crit, idx) => (
              <div key={idx} className="crit-row">
                <div className="crit-meta">
                  <span className="crit-subtitle">{crit.subtitle}</span>
                  <p className="crit-hint">{crit.explication}</p>
                </div>

                <div className="sliders-container">
                  {task.is_common ? (
                    renderSlider(colId, task.id, idx, 'common', crit.ratings['common'], "Note du groupe")
                  ) : (
                    students.map(s => renderSlider(colId, task.id, idx, s.id, crit.ratings[s.id], s.name))
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  function renderSlider(colId, tId, cIdx, eId, val, label) {
    return (
      <div className="slider-group" key={eId}>
        <div className="slider-label-row">
          <span className="entity-name">{label}</span>
          <span className="current-level-text" data-level={Math.ceil(val)}>{getLabel(val)}</span>
        </div>
        <input 
          type="range" 
          min="0" max="4" step="1" 
          value={val}
          className="modern-slider"
          onChange={(e) => updateRating(colId, tId, cIdx, eId, e.target.value)}
        />
        <div className="slider-ticks">
          <span>|</span><span>|</span><span>|</span><span>|</span><span>|</span>
        </div>
      </div>
    );
  }
};

export default UserSurvey;