
import React from 'react';
import { Users, BookOpen, Layers, Download, Bot, Lock } from 'lucide-react';
import '../../styles/navbar/FeaturesDropdown.css';

export default function FeaturesDropdown({ onSelectFeature, isLoggedIn }) {
  const features = [
    {
      id: 'supervisors',
      title: 'Supervisor Directory',
      desc: 'Explore faculty by research domain & paper count',
      icon: Users,
      href: '#supervisors'
    },
    {
      id: 'guidelines',
      title: 'Thesis & Defense Guidelines',
      desc: 'Topic formulation & 3-stage marking rubrics',
      icon: BookOpen,
      href: '#guidelines'
    },
    {
      id: 'journals',
      title: 'Journals & Paper Discovery',
      desc: 'Direct search links for IEEE, Scopus, ScienceDirect',
      icon: Layers,
      href: '#journals'
    },
    {
      id: 'templates',
      title: 'Download Templates Hub',
      desc: 'Official IIUC Report (.DOCX), LaTeX (.ZIP) & PPTX',
      icon: Download,
      href: '#templates'
    },
    {
      id: 'ai-assistant',
      title: 'AI Research Assistant',
      desc: 'Smart mentor and literature recommendations',
      icon: Bot,
      href: '#ai-assistant'
    }
  ];

  // Logged-in view: simple numbered list, no lock badge
  if (isLoggedIn) {
    return (
      <div className="features-dropdown-menu">
        <div className="dropdown-items-grid">
          {features.map((item, index) => (
            <a
              key={item.id}
              href={item.href}
              className="dropdown-item-card dropdown-item-numbered"
              onClick={onSelectFeature}
            >
              <span className="dropdown-item-number">{index + 1}</span>
              <span className="dropdown-item-title">{item.title}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="features-dropdown-menu">
      <div className="dropdown-header">
        <span className="dropdown-header-title">Platform Features</span>
        <span className="dropdown-header-badge">
          <Lock className="w-3 h-3 text-amber-600" />
          <span>Login Required for Full Access</span>
        </span>
      </div>

      <div className="dropdown-items-grid">
        {features.map((item) => {
          const IconComponent = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              className="dropdown-item-card"
              onClick={onSelectFeature}
            >
              <div className="dropdown-item-icon-box">
                <IconComponent className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="dropdown-item-info">
                <div className="dropdown-item-title-row">
                  <span className="dropdown-item-title">{item.title}</span>
                </div>
                <p className="dropdown-item-desc">{item.desc}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

