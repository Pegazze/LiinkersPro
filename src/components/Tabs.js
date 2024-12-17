import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineHome, AiOutlineCalculator, AiOutlineTeam } from 'react-icons/ai'; // Exemple avec react-icons
import './Tabs.css';

const Tabs = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="tabs-container">
      <div className="content">{children}</div>
      <div className="tab-bar">
        <div
          className={`tab-item ${location.pathname === '/simulateur' ? 'active' : ''}`}
          onClick={() => navigate('/simulateur')}
        >
          <AiOutlineHome size={24} />
          <span>Simulateur</span>
        </div>
        <div
          className={`tab-item ${location.pathname === '/simulateur-interactif' ? 'active' : ''}`}
          onClick={() => navigate('/simulateur-interactif')}
        >
          <AiOutlineCalculator size={24} />
          <span>Interactif</span>
        </div>
        <div
          className={`tab-item ${location.pathname === '/ListeContacts' ? 'active' : ''}`}
          onClick={() => navigate('/ListeContacts')}
        >
          <AiOutlineTeam size={24} />
          <span>Liste Contacts</span>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
