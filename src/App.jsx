import React from 'react';
// Importation des outils de navigation
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importation de vos pages
import AdminPage from './pages/AdminPage/AdminPage.jsx';
import UserPage from './pages/UserPage/UserPage.jsx';
import Home from './pages/Home/Home.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import Settings from './pages/AdminPage/SettingsPage.jsx';
import UserSurvey from './pages/UserPage/UserSurvey.jsx';
import StatsPage from './pages/UserPage/StatsPage.jsx';

function App() {
  return (
    // Le BrowserRouter doit ENVELOPPER tout le reste
    <BrowserRouter>
      <Routes>
        {/* Route par défaut (Page de sélection) */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<LoginPage />} />

        {/* Route pour l'enseignant */}
        <Route path="/admin" element={<AdminPage />} />
        {/* Route pour l'enseignant */}
        <Route path="/admin/settings" element={<Settings />} />

        {/* Route pour l'étudiant */}
        <Route path="/user" element={<UserPage />} />

        <Route path="/user/survey" element={<UserSurvey />} />
        <Route path="/user/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
