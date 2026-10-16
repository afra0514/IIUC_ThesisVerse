import React from 'react';
import '../../styles/hero/StatsCounter.css';

export default function StatsCounter() {
  const stats = [
    { value: '45+', label: 'Verified Faculty' },
    { value: '300+', label: 'Research Papers' },
    { value: '100%', label: 'Free Verified Templates' }
  ];

  return (
    <div className="stats-card-wrapper">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-column">
            <span className="stat-number">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}