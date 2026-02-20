import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './UserPage.css';

const UserPage = () => {
  const [columns, setColumns] = useState({
    contenu: [],
    paraverbal: [],
    corporel: [],
    support: [],
    creativite: [],
  });

  const [totalScore, setTotalScore] = useState(0);

  // Charger les options depuis Supabase
  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await supabase
        .from('options')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        const organized = {
          contenu: [],
          paraverbal: [],
          corporel: [],
          support: [],
          creativite: [],
        };
        data.forEach((opt) => {
          if (organized[opt.column_id]) {
            organized[opt.column_id].push({
              ...opt,
              userRating: 0,
              userComment: '',
            });
          }
        });
        setColumns(organized);
      }
    };
    fetchOptions();
  }, []);

  // Calcul du score total
  useEffect(() => {
    let totalPoints = 0;
    let cardCount = 0;
    Object.values(columns).forEach((col) => {
      col.forEach((task) => {
        totalPoints += task.userRating;
        cardCount++;
      });
    });
    const finalScore = cardCount > 0 ? (totalPoints / (cardCount * 4)) * 20 : 0;
    setTotalScore(finalScore.toFixed(1));
  }, [columns]);

  const updateLocalData = (columnId, taskId, field, value) => {
    setColumns({
      ...columns,
      [columnId]: columns[columnId].map((t) =>
        t.id === taskId ? { ...t, [field]: value } : t
      ),
    });
  };

  const saveEvaluation = async () => {
    const allTasks = Object.values(columns).flat();
    const isIncomplete = allTasks.some((t) => t.userRating === 0);

    if (isIncomplete) {
      return alert('Chaque critère doit recevoir au moins une étoile.');
    }

    const dataToSave = allTasks.map((task) => ({
      option_id: task.id,
      rating: task.userRating,
      comment: task.userComment,
    }));

    const { error } = await supabase.from('evaluations').insert(dataToSave);

    if (error) {
      alert("Erreur lors de l'enregistrement.");
    } else {
      alert(`Évaluation enregistrée avec succès !`);
    }
  };

  const renderColumn = (id) => (
    <td className="column">
      {columns[id].map((task) => (
        <div key={task.id} className="task">
          <h2>{task.title}</h2>
          <p className="explication">{task.explication}</p>

          <textarea
            placeholder="Commentaire..."
            rows="3"
            value={task.userComment}
            onChange={(e) =>
              updateLocalData(id, task.id, 'userComment', e.target.value)
            }
          />

          <div className="task-footer">
            <div className="star-rating">
              {[1, 2, 3, 4].map((num) => (
                <span
                  key={num}
                  className={`star ${task.userRating >= num ? 'active' : ''}`}
                  onClick={() =>
                    updateLocalData(id, task.id, 'userRating', num)
                  }
                >
                  ★
                </span>
              ))}
            </div>
            <div className="drag-indicator">⋮⋮</div>
          </div>
        </div>
      ))}
    </td>
  );

  return (
    <div className="body-container">
      {/* Score affiché en haut à droite */}
      <div className="top-right-score">
        Note : <span>{totalScore}</span> / 20
      </div>

      <h1>Évaluation d’Exposé Oral</h1>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th rowSpan="2">Contenu</th>
              <th colSpan="2">Langage Non Verbal</th>
              <th rowSpan="2">Support Visuel</th>
              <th rowSpan="2">Créativité</th>
            </tr>
            <tr>
              <th>Paraverbal</th>
              <th>Corporel</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {renderColumn('contenu')}
              {renderColumn('paraverbal')}
              {renderColumn('corporel')}
              {renderColumn('support')}
              {renderColumn('creativite')}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bottom-actions">
        <button className="save-button" onClick={saveEvaluation}>
          Enregistrer l'évaluation
        </button>
      </div>
    </div>
  );
};

export default UserPage;
