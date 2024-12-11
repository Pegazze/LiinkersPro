import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Accueil.css';

function Accueil() {
  const navigate = useNavigate(); // Hook pour naviguer entre les pages

  return (
    <div className="App-header">
      <img src="./fuseeB.png" alt="fuseeB" className="App-image" />
      <h1>Bienvenue sur Liinkers Pro</h1>
      <p>JE, TU, NOUS, ENSEMBLE POUR UN MONDE QUI NOUS RESSEMBLE!</p>
      {/* Bouton pour aller vers le simulateur */}
      <button onClick={() => navigate('/simulateur')} className="App-button">
        Se lancer dans l'aventure
      </button>
    </div>
  );
}

export default Accueil;
