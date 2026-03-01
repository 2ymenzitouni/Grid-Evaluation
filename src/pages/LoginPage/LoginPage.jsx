import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Vérification des identifiants spécifiques : adnene / admin
    if (username === 'adnene' && password === 'admin') {
      navigate('/admin');
    } else {
      alert('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Connexion Enseignant</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: adnene"
              required
            />
          </div>
          <div className="input-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Se connecter
          </button>
        </form>
        <button className="back-btn" onClick={() => navigate('/')}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
