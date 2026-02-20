import React from 'react';
// Importation des outils de navigation
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importation de vos pages
import AdminPage from './pages/AdminPage/AdminPage.jsx';
import UserPage from './pages/UserPage/UserPage.jsx';
import Home from './pages/Home/Home.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';

function App() {
  return (
    // Le BrowserRouter doit ENVELOPPER tout le reste
    <BrowserRouter>
      <Routes>
        {/* Route par défaut (Page de sélection) */}
        <Route path="Grid-Evaluation" element={<Home />} />

        <Route path="Grid-Evaluation/login" element={<LoginPage />} />

        {/* Route pour l'enseignant */}
        <Route path="Grid-Evaluation/admin" element={<AdminPage />} />

        {/* Route pour l'étudiant */}
        <Route path="Grid-Evaluation/user" element={<UserPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
