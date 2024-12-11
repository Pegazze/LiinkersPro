import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Accueil from './pages/Accueil'; // Page d'accueil
import Simulateur from './pages/Simulateur'; // Page du simulateur
import Simulateurinteractif from './pages/Simulateurinteractif'; // Page du simulateur interactif

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route pour la page d'accueil */}
          <Route path="/" element={<Accueil />} />

          {/* Route pour la page du simulateur */}
          <Route path="/simulateur" element={<Simulateur />} />

          {/* Route pour la page du simulateur interactif */}
          <Route path="/simulateur-interactif" element={<Simulateurinteractif />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;