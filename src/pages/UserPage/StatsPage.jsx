import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './StatsPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const StatsPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: evals } = await supabase
      .from('evaluations')
      .select('*')
      .order('created_at', { ascending: true });
    const { data: stds } = await supabase.from('students').select('*');
    if (evals) setEvaluations(evals);
    if (stds) setStudents(stds);
    setLoading(false);
  };

  const stats = useMemo(() => {
    if (!evaluations.length || !students.length) return null;

    const summary = {};
    students.forEach((s) => {
      summary[s.id] = { name: s.name, total: 0, count: 0 };
    });

    evaluations.forEach((ev) => {
      students.forEach((s) => {
        summary[s.id].total += ev.final_scores_per_student?.[s.id] || 0;
        summary[s.id].count += 1;
      });
    });

    return students.map((s) => ({
      name: summary[s.id].name,
      total: (summary[s.id].total / (summary[s.id].count || 1)).toFixed(2),
    }));
  }, [evaluations, students]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        color: '#000',
        align: 'end',
        anchor: 'end',
        offset: -2,
        font: { size: 12, weight: 'bold' },
        formatter: (value) => value,
      },
      legend: { display: true, position: 'bottom' },
      tooltip: { enabled: true },
    },
    layout: { padding: { top: 20 } },
  };

  const barData = {
    labels: stats?.map((s) => s.name) || [],
    datasets: [
      {
        label: 'Moyenne Générale / 20',
        data: stats?.map((s) => s.total) || [],
        backgroundColor: '#6366f1',
        borderRadius: 10,
      },
    ],
  };

  const pieData = {
    labels: stats?.map((s) => s.name) || [],
    datasets: [
      {
        data: stats?.map((s) => s.total) || [],
        backgroundColor: [
          '#6366f1',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading)
    return <div className="loader">Chargement des statistiques...</div>;

  return (
    <div className="stats-page">
      <header className="stats-hero">
        <h1>Dashboard Analytique</h1>
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="m-label">Participants</span>
            <span className="m-value">{evaluations.length}</span>
          </div>
          <div className="metric-card">
            <span className="m-label">Candidats</span>
            <span className="m-value">{students.length}</span>
          </div>
        </div>
      </header>

      <main className="stats-content">
        <section className="visuals-row">
          <div className="chart-wrapper">
            <h3>Moyennes Globales</h3>
            <Bar data={barData} options={chartOptions} />
          </div>
          <div className="chart-wrapper">
            <h3>Répartition des Scores</h3>
            <Pie data={pieData} options={chartOptions} />
          </div>
        </section>

        <section className="history-section">
          <h3>Détails des Évaluations par Participant</h3>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="sticky-col">Évaluateur</th>
                  {students.map((s) => (
                    <th key={s.id} className="student-header">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evaluations.map((ev, idx) => (
                  <tr key={ev.id}>
                    <td className="sticky-col">E{idx + 1}</td>
                    {students.map((s) => (
                      <td key={s.id} className="score-cell">
                        <div className="detailed-score-box">
                          <div className="main-total">
                            Total: {ev.final_scores_per_student?.[s.id] || 0}
                          </div>
                          <div className="full-word-breakdown">
                            <div className="breakdown-item">
                              <span className="cat-label">Contenu:</span>
                              <span className="cat-val">
                                {ev.score_contenu?.[s.id] || 0}
                              </span>
                            </div>
                            <div className="breakdown-item">
                              <span className="cat-label">Paraverbal:</span>
                              <span className="cat-val">
                                {ev.score_paraverbal?.[s.id] || 0}
                              </span>
                            </div>
                            <div className="breakdown-item">
                              <span className="cat-label">Corporel:</span>
                              <span className="cat-val">
                                {ev.score_corporel?.[s.id] || 0}
                              </span>
                            </div>
                            <div className="breakdown-item">
                              <span className="cat-label">Support:</span>
                              <span className="cat-val">
                                {ev.score_support?.[s.id] || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StatsPage;
