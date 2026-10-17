import React from 'react';
import { GraduationCap, BookOpen } from 'lucide-react';
import GlobalSearchBar from './GlobalSearchBar';
import TopicPills from './TopicPills';
import StatsCounter from './StatsCounter';
import '../../styles/hero/Hero.css';

export default function Hero({ onSearch, onSelectTopic, onOpenAuthModal, isLoggedIn }) {
  const guestLockProps = isLoggedIn
    ? {}
    : {
        onMouseDownCapture: (e) => e.preventDefault(),
        onClickCapture: (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof onOpenAuthModal === 'function') onOpenAuthModal();
        },
        onKeyDownCapture: (e) => {
          if (e.key === 'Tab' || e.key === 'Shift') return;
          e.preventDefault();
          e.stopPropagation();
          if (typeof onOpenAuthModal === 'function') onOpenAuthModal();
        }
      };

  return (
    <section className="hero-section" id="home">
      
      <div className="hero-bg-overlay"></div>
      
      <div className="hero-container"> 
      

        <h1 className="hero-main-title">
          Your Centralized Thesis &amp;<br className="hidden sm:inline" /> Research Ecosystem at IIUC
        </h1>
        <p className="hero-subtitle">
          Find verified faculty supervisors, access indexed journal portals, download official thesis templates, and receive AI-driven guidance.
        </p>

        <div style={{ display: 'contents' }} {...guestLockProps}>
          <GlobalSearchBar onSearch={onSearch} />
        </div>

        <TopicPills onSelectTopic={onSelectTopic} />
        
      <StatsCounter />

      </div>
    </section>
  );
}