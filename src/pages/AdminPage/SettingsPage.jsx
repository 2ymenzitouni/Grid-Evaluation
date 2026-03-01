import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './SettingsPage.css';

const Settings = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState({
    contenu: [],
    paraverbal: [],
    corporel: [],
    support: [],
    creativite: [],
  });
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('options')
      .select('*')
      .order('created_at', { ascending: true });

    if (data) {
      const newCols = {
        contenu: [],
        paraverbal: [],
        corporel: [],
        support: [],
        creativite: [],
      };
      data.forEach((item) => {
        if (newCols[item.column_id]) newCols[item.column_id].push(item);
      });
      setColumns(newCols);
      calculateTotal(newCols);
    }
  };

  const calculateTotal = (cols) => {
    let total = 0;
    Object.values(cols)
      .flat()
      .forEach((task) => {
        task.criteria_list?.forEach((crit) => {
          total += parseFloat(crit.points || 0);
        });
      });
    setTotalPoints(total);
  };

  const handlePointChange = (columnId, taskId, critIdx, value) => {
    const newCols = { ...columns };
    const task = newCols[columnId].find((t) => t.id === taskId);

    // On accepte les nombres décimaux (ex: 2.5)
    const numValue = value === '' ? 0 : parseFloat(value);

    task.criteria_list[critIdx].points = numValue;
    setColumns(newCols);
    calculateTotal(newCols);
  };

  const saveSettings = async () => {
    const allTasks = Object.values(columns).flat();
    const promises = allTasks.map((task) =>
      supabase
        .from('options')
        .update({ criteria_list: task.criteria_list })
        .eq('id', task.id)
    );

    try {
      await Promise.all(promises);
      alert(`Barème enregistré ! Total : ${totalPoints} points.`);
    } catch (err) {
      alert('Erreur de sauvegarde : ' + err.message);
    }
  };

  const renderSection = (id, label) => (
    <div className="settings-column">
      <h2 className="column-label">{label}</h2>
      {columns[id].map((task) => (
        <div key={task.id} className="settings-card">
          <h3 className="settings-task-title">{task.title}</h3>
          <div className="settings-sub-list">
            {task.criteria_list?.map((crit, idx) => (
              <div key={idx} className="settings-sub-item">
                <div className="sub-info">
                  <span className="sub-title">{crit.subtitle}</span>
                  <small className="sub-desc">
                    {crit.explication?.substring(0, 40)}...
                  </small>
                </div>
                <div className="point-input-wrapper">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={crit.points || ''}
                    onChange={(e) =>
                      handlePointChange(id, task.id, idx, e.target.value)
                    }
                    placeholder="0"
                  />
                  <span className="pts-unit">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button onClick={() => navigate('/admin')} className="back-btn">
          ← Admin
        </button>
        <h1 className="settings-title">Configuration du Barème</h1>
      </div>

      <div className="settings-grid">
        {renderSection('contenu', 'Contenu')}
        {renderSection('paraverbal', 'Paraverbal')}
        {renderSection('corporel', 'Corporel')}
        {renderSection('support', 'Support')}
        {renderSection('creativite', 'Créativité')}
      </div>

      <footer className="settings-footer">
        <div className="total-box">
          <span className="total-label">Total des points :</span>
          <span className="total-value">{totalPoints}</span>
        </div>
        <button className="save-btn" onClick={saveSettings}>
          💾 Enregistrer le barème
        </button>
      </footer>
    </div>
  );
};

export default Settings;
