import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Accueil from './pages/Accueil'; // Page d'accueil
import Simulateur from './pages/Simulateur'; // Page du simulateur
import Simulateurinteractif from './pages/Simulateurinteractif'; // Page du simulateur interactif
import ListeContacts from './pages/ListeContacts'; // Page de la Liste de Contacts
import Tabs from './components/Tabs'; // Composant des onglets

function App() {
  const [firstVisit, setFirstVisit] = useState(true);

  // Gestion de la redirection après la première visite
  useEffect(() => {
    const isFirstVisit = localStorage.getItem('firstVisit');
    if (isFirstVisit) setFirstVisit(false);
  }, []);

  const handleFirstVisit = () => {
    localStorage.setItem('firstVisit', 'false');
    setFirstVisit(false);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Page d'accueil, uniquement visible lors du premier chargement */}
          {firstVisit && (
            <Route
              path="/"
              element={<Accueil onNavigate={handleFirstVisit} />}
            />
          )}

          {/* Redirection après la première visite */}
          {!firstVisit && <Route path="/" element={<Navigate to="/simulateur" />} />}

          {/* Routes avec les onglets */}
          <Route
            path="/simulateur"
            element={
              <Tabs>
                <Simulateur />
              </Tabs>
            }
          />
          <Route
            path="/simulateur-interactif"
            element={
              <Tabs>
                <Simulateurinteractif />
              </Tabs>
            }
          />
          <Route
            path="/ListeContacts"
            element={
              <Tabs>
                <ListeContacts />
              </Tabs>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
