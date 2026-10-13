import React from 'react';
import { Users, BookOpen, ShieldCheck } from 'lucide-react';
import '../../styles/aboutAndContact/AboutUsContent.css';

export default function AboutUsContent() {
  const pillars = [
    {
      title: 'Verified Faculty',
      desc: 'Every supervisor profile is sourced from official CSE & EEE department records.',
      icon: Users
    },
    {
      title: 'One Resource Hub',
      desc: 'Templates, rubrics and journal portals in a single place instead of scattered drives.',
      icon: BookOpen
    },
    {
      title: 'Student-first',
      desc: 'Designed with IIUC students to shorten the path from topic idea to final defense.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="about-us-wrapper">
      
      <span className="about-feature-tag">ABOUT US</span>

      <h2 className="about-main-heading">
        The academic home for every IIUCian researcher
      </h2>

      <p className="about-description">
        IIUC ThesisVerse is the central thesis assistance platform for students of International Islamic University Chittagong. We connect final-year students with the right supervisors, make official formats and evaluation rubrics transparent, and guide first-time researchers toward credible, high-impact publications.
      </p>

      <div className="about-pillars-grid">
        {pillars.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div key={idx} className="about-pillar-card">
              <div className="about-pillar-icon-box">
                <IconComponent className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="about-pillar-title">{item.title}</h3>
              <p className="about-pillar-desc">{item.desc}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
}