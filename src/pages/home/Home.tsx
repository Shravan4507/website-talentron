import React from 'react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <div className="accent-glow" />
      
      <div className="coming-soon-container">
        <h1 className="coming-soon-title">
          Coming<br />Soon...
        </h1>
        <p className="coming-soon-subtitle">
          Talentron 2026 is loading
        </p>
      </div>
    </div>
  );
};

export default Home;
