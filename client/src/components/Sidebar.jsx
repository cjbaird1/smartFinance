import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/sidebar.css'; // We'll create this CSS file for styling

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-title">
        <span role="img" aria-label="dashboard">📊</span> Dashboard
      </div>
      <NavLink 
        to="/search" 
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        <span role="img" aria-label="search">🔍</span> Search Ticker
      </NavLink>
      
      <NavLink 
        to="/trade-simulator" 
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        <span role="img" aria-label="trade simulator">🧪</span> Trade Simulator
      </NavLink>
        
      <NavLink 
        to="/news" 
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        <span role="img" aria-label="news">📰</span> News & Sentiment
      </NavLink>

      <NavLink 
        to="/predictions" 
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        <span role="img" aria-label="predictions">🤖</span> Predictions
      </NavLink>
      <NavLink 
        to="/strategy" 
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        <span role="img" aria-label="strategy">❓</span> FAQ
      </NavLink>
      
      <NavLink 
        to="/education" 
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        <span role="img" aria-label="education">📚</span> Education Center
      </NavLink>
      <NavLink 
        to="/alerts" 
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
      >
        <span role="img" aria-label="alerts">🔔</span> Alerts
      </NavLink>
      
      <div className="sidebar-bottom">
        <NavLink 
          to="/charts" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          style={{ marginTop: 'auto' }}
        >
          <span role="img" aria-label="settings">⚙️</span> Settings
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar; 