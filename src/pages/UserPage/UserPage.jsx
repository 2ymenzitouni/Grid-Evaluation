import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import './UserPage.css';

const UserPage = () => {
  const [columns, setColumns] = useState({
    contenu: [],
    paraverbal: [],
    corporel: [],
    support: [],
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const levels = [
    { label: 'Passable', mult: 1 },
    { label: 'Bien', mult: 2 },
    { label: 'Très Bien', mult: 3 },
    { label: 'Excellent', mult: 4 },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: opt } = await supabase
      .from('options')
      .select('*')
      .order('created_at', { ascending: true });
    const { data: std } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: true });

    if (opt && std) {
      setStudents(std);
      const organized = {
        contenu: [],
        paraverbal: [],
        corporel: [],
        support: [],
      };
      opt.forEach((o) => {
        if (organized.hasOwnProperty(o.column_id)) {
          const criteriaWithRating =
            o.criteria_list?.map((crit) => ({
              ...crit,
              ratings: o.is_common
                ? { group: 0 }
                : Object.fromEntries(std.map((s) => [s.id, 0])),
            })) || [];
          organized[o.column_id].push({
            ...o,
            criteria_list: criteriaWithRating,
          });
        }
      });
      setColumns(organized);
    }
    setLoading(false);
  };

  // Logic: Calculate totals AND category-specific scores
  const fullStats = useMemo(() => {
    const stats = {};
    students.forEach((s) => {
      stats[s.id] = {
        total: 0,
        contenu: 0,
        paraverbal: 0,
        corporel: 0,
        support: 0,
      };
    });

    Object.entries(columns).forEach(([colId, tasks]) => {
      tasks.forEach((task) => {
        task.criteria_list.forEach((crit) => {
          const points = parseFloat(crit.points) || 0;
          const maxMult = 4;

          if (task.is_common) {
            const val = crit.ratings['group'] || 0;
            const scoreToAdd = val * (points / maxMult);
            students.forEach((s) => {
              stats[s.id][colId] += scoreToAdd;
              stats[s.id].total += scoreToAdd;
            });
          } else {
            students.forEach((s) => {
              const val = crit.ratings[s.id] || 0;
              const scoreToAdd = val * (points / maxMult);
              stats[s.id][colId] += scoreToAdd;
              stats[s.id].total += scoreToAdd;
            });
          }
        });
      });
    });

    // Rounding to 2 decimals
    Object.keys(stats).forEach((id) => {
      ['total', 'contenu', 'paraverbal', 'corporel', 'support'].forEach(
        (key) => {
          stats[id][key] = parseFloat(stats[id][key].toFixed(2));
        }
      );
    });
    return stats;
  }, [columns, students]);

  const updateRating = (colId, taskId, critIdx, entityId, val) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setColumns((prev) => ({
      ...prev,
      [colId]: prev[colId].map((t) => {
        if (t.id === taskId) {
          const newList = [...t.criteria_list];
          newList[critIdx].ratings = {
            ...newList[critIdx].ratings,
            [entityId]: val,
          };
          return { ...t, criteria_list: newList };
        }
        return t;
      }),
    }));
  };

  const handleSubmit = async () => {
    const allResponses = {};
    const categoryMaps = {
      score_contenu: {},
      score_paraverbal: {},
      score_corporel: {},
      score_support: {},
      final_scores_per_student: {},
    };

    // Prepare objects for each column in Supabase
    students.forEach((s) => {
      categoryMaps.score_contenu[s.id] = fullStats[s.id].contenu;
      categoryMaps.score_paraverbal[s.id] = fullStats[s.id].paraverbal;
      categoryMaps.score_corporel[s.id] = fullStats[s.id].corporel;
      categoryMaps.score_support[s.id] = fullStats[s.id].support;
      categoryMaps.final_scores_per_student[s.id] = fullStats[s.id].total;
    });

    // Capture raw answers for history/details
    Object.values(columns)
      .flat()
      .forEach((t) => {
        t.criteria_list.forEach((c) => {
          allResponses[c.subtitle] = c.ratings;
        });
      });

    const { error } = await supabase.from('evaluations').insert([
      {
        responses: allResponses,
        ...categoryMaps,
      },
    ]);

    if (error) {
      alert("Erreur lors de l'enregistrement");
    } else {
      alert('Évaluation enregistrée avec succès !');
      window.location.reload();
    }
  };

  if (loading) return <div className="loader">Chargement...</div>;

  return (
    <div className="user-page-responsive">
      <header className="smooth-header">
        <div className="header-inner">
          <h1>Live Evaluation</h1>
          <div className="score-summary-row">
            {students.map((s) => (
              <div key={s.id} className="mini-score-card">
                <span className="mini-name">{s.name.split(' ')[0]}</span>
                <span className="mini-val">{fullStats[s.id].total}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="content-scroll">
        {Object.entries(columns).map(([name, tasks]) => (
          <section key={name} className="fade-in-section">
            <h2 className="section-title">{name.toUpperCase()}</h2>
            {tasks.map((t) => (
              <div key={t.id} className="smooth-card">
                <div className="task-header">
                  <h3 className="task-title">{t.title}</h3>
                  {t.is_common && <span className="common-badge">Groupe</span>}
                </div>

                {t.criteria_list.map((c, i) => (
                  <div key={i} className="crit-item">
                    <div className="crit-header-row">
                      <p className="crit-name">{c.subtitle}</p>
                      <span className="crit-pts-badge">{c.points} pts</span>
                    </div>

                    {t.is_common ? (
                      <div className="rating-row">
                        <div className="rating-group-horizontal">
                          {levels.map((l) => (
                            <button
                              key={l.mult}
                              className={`rate-btn ${
                                c.ratings['group'] === l.mult ? 'active' : ''
                              }`}
                              onClick={() =>
                                updateRating(name, t.id, i, 'group', l.mult)
                              }
                            >
                              {l.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      students.map((s) => (
                        <div key={s.id} className="rating-row">
                          <span className="entity-label">{s.name}</span>
                          <div className="rating-group-horizontal">
                            {levels.map((l) => (
                              <button
                                key={l.mult}
                                className={`rate-btn ${
                                  c.ratings[s.id] === l.mult ? 'active' : ''
                                }`}
                                onClick={() =>
                                  updateRating(name, t.id, i, s.id, l.mult)
                                }
                              >
                                {l.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            ))}
          </section>
        ))}
      </main>

      <footer className="smooth-footer">
        <button className="submit-button" onClick={handleSubmit}>
          Soumettre l'Évaluation
        </button>
      </footer>
    </div>
  );
};

export default UserPage;
