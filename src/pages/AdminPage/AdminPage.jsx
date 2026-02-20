import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState({
    contenu: [],
    paraverbal: [],
    corporel: [],
    support: [],
    creativite: [],
  });

  // CHARGEMENT INITIAL DES DONNÉES
  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await supabase
        .from('options')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur de chargement:', error);
      } else {
        const newColumns = {
          contenu: [],
          paraverbal: [],
          corporel: [],
          support: [],
          creativite: [],
        };
        data.forEach((item) => {
          if (newColumns[item.column_id]) {
            newColumns[item.column_id].push(item);
          }
        });
        setColumns(newColumns);
      }
    };
    fetchOptions();
  }, []);

  // AJOUTER UN CRITÈRE
  const addTask = async (columnId) => {
    const newTaskObj = {
      title: `Nouvelle Option`,
      explication: 'Cliquez pour modifier...',
      column_id: columnId,
    };

    const { data, error } = await supabase
      .from('options')
      .insert([newTaskObj])
      .select();

    if (!error && data) {
      setColumns({ ...columns, [columnId]: [...columns[columnId], data[0]] });
    }
  };

  // SUPPRIMER UN CRITÈRE
  const deleteTask = async (columnId, taskId) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette option ?')) {
      const { error } = await supabase
        .from('options')
        .delete()
        .eq('id', taskId);
      if (!error) {
        setColumns({
          ...columns,
          [columnId]: columns[columnId].filter((t) => t.id !== taskId),
        });
      }
    }
  };

  // MISE À JOUR DANS LA BASE DE DONNÉES
  const updateTaskInDB = async (taskId, updates) => {
    await supabase.from('options').update(updates).eq('id', taskId);
  };

  // LOGIQUE DU DRAG & DROP
  const onDragStart = (e, taskId, sourceCol) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceCol', sourceCol);
  };

  const onDrop = async (e, destCol) => {
    const taskId = e.dataTransfer.getData('taskId');
    const sourceCol = e.dataTransfer.getData('sourceCol');
    if (sourceCol === destCol) return;

    const taskToMove = columns[sourceCol].find((t) => String(t.id) === taskId);

    // Mise à jour visuelle immédiate
    setColumns({
      ...columns,
      [sourceCol]: columns[sourceCol].filter((t) => String(t.id) !== taskId),
      [destCol]: [...columns[destCol], { ...taskToMove, column_id: destCol }],
    });

    // Mise à jour en base de données
    await updateTaskInDB(taskId, { column_id: destCol });
  };

  const renderColumn = (id) => (
    <td
      className="column-cell"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, id)}
    >
      {columns[id].map((task) => (
        <div
          key={task.id}
          className="task-card"
          draggable
          onDragStart={(e) => onDragStart(e, task.id, id)}
        >
          <button
            className="delete-btn"
            onClick={() => deleteTask(id, task.id)}
          >
            ×
          </button>

          <h2
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              updateTaskInDB(task.id, { title: e.target.innerText })
            }
          >
            {task.title}
          </h2>

          <p
            contentEditable
            suppressContentEditableWarning
            className="explication-text"
            onBlur={(e) =>
              updateTaskInDB(task.id, { explication: e.target.innerText })
            }
          >
            {task.explication}
          </p>

          <div className="card-footer">
            <div className="drag-handle">⋮⋮</div>
          </div>
        </div>
      ))}
      <button className="add-button" onClick={() => addTask(id)}>
        + Ajouter un critère
      </button>
    </td>
  );

  return (
    <div className="body-container">
      {/* Bouton de navigation retour */}
      <button
        onClick={() => navigate('/Grid-Evaluation/')}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          cursor: 'pointer',
          borderRadius: '8px',
          border: '1px solid #ccc',
          background: '#fff',
        }}
      >
        ← Retour à l'accueil
      </button>

      <h1 className="grid-title">Gestion de la Grille (Admin)</h1>

      <div className="table-wrapper">
        <table className="eval-table">
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
    </div>
  );
};

export default AdminPage;
