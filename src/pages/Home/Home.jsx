import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="selection-container">
      <div className="selection-card">
        <h1>Bienvenue</h1>
        <p className="subtitle">Sélectionnez votre profil pour continuer.</p>

        <div className="button-group">
          {/* Option Étudiant */}
          <div className="role-option" onClick={() => navigate('user')}>
            <div className="icon">🎓</div>
            <h2>Étudiant</h2>
            <p>Passer mon évaluation</p>
            <button className="select-btn student">Choisir</button>
          </div>

          {/* Option Enseignant -> REDIRIGE VERS LOGIN */}
          <div className="role-option" onClick={() => navigate('login')}>
            <div className="icon">👨‍🏫</div>
            <h2>Enseignant</h2>
            <p>Gérer la grille d'évaluation</p>
            <button className="select-btn teacher">Choisir</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
