import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar/Navbar';
import Hero from '../components/hero/Hero';
import SupervisorSection from '../components/supervisorDirectory/SupervisorSection';
import GuidelinesSection from '../components/thesisGuidelines/GuidelinesSection';
import JournalSection from '../components/journalDiscovery/JournalSection';
import TemplateSection from '../components/templateHub/TemplateSection';
import AiAssistantBanner from '../components/aiAssistantBanner/AiAssistantBanner';
import AboutAndContactSection from '../components/aboutAndContact/AboutAndContactSection';
import Footer from '../components/footer/Footer';
import FloatingChatbotButton from '../components/chatbot/FloatingChatbotButton';
import AuthModal from '../components/auth/AuthModal';
import StudentDashboard from '../components/dashboard/StudentDashboard';

import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import '../styles/pages/Home.css';

const savedKeyFor = (user) => `iiuc_thesis_saved_${(user && user.studentId) || 'guest'}`;

function loadSavedItems(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

export default function Home() {
  const { isLoggedIn, user, login, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();
  const { openChat } = useChat();

  const savedKey = savedKeyFor(user);
  const [saved, setSaved] = useState(() => ({ key: savedKey, items: loadSavedItems(savedKey) }));

  if (saved.key !== savedKey) {
    setSaved({ key: savedKey, items: loadSavedItems(savedKey) });
  }
  const savedItems = saved.key === savedKey ? saved.items : [];

  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      localStorage.setItem(saved.key, JSON.stringify(saved.items));
    } catch (err) {
    }
  }, [saved, isLoggedIn]);

  const savedKeys = savedItems.map((i) => i.key);

  const handleToggleSave = (item) => {
    setSaved((prev) => ({
      key: prev.key,
      items: prev.items.some((i) => i.key === item.key)
        ? prev.items.filter((i) => i.key !== item.key)
        : [...prev.items, item]
    }));
  };

  const [heroSearch, setHeroSearch] = useState({ text: '', nonce: 0 });

  const handleHeroSearch = (query) => {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    setHeroSearch({ text: typeof query === 'string' ? query.trim() : '', nonce: Date.now() });
    document.getElementById('supervisors')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page-root">
      <Navbar onOpenAuthModal={openAuthModal} />
      <Hero
        onSearch={handleHeroSearch}
        onSelectTopic={handleHeroSearch}
        onOpenAuthModal={openAuthModal}
        isLoggedIn={isLoggedIn}
      />
      {isLoggedIn && (
        <StudentDashboard
          user={user}
          savedItems={savedItems}
          onToggleSave={handleToggleSave}
        />
      )}

      <SupervisorSection
        onOpenAuthModal={openAuthModal}
        isLoggedIn={isLoggedIn}
        savedKeys={savedKeys}
        onToggleSave={handleToggleSave}
        externalSearch={heroSearch}
      />
      <GuidelinesSection
        onOpenAuthModal={openAuthModal}
        isLoggedIn={isLoggedIn}
      />
      <JournalSection
        onOpenAuthModal={openAuthModal}
        isLoggedIn={isLoggedIn}
        savedKeys={savedKeys}
        onToggleSave={handleToggleSave}
        searchKeyword={heroSearch.text}
      />
      <TemplateSection
        onOpenAuthModal={openAuthModal}
        isLoggedIn={isLoggedIn}
        savedKeys={savedKeys}
        onToggleSave={handleToggleSave}
      />
      <AiAssistantBanner
        onOpenChatbot={openChat}
        onOpenAuthModal={openAuthModal}
        isLoggedIn={isLoggedIn}
      />
      <AboutAndContactSection />
      <Footer onOpenAuthModal={openAuthModal} isLoggedIn={isLoggedIn} />
      <FloatingChatbotButton
        onOpenAuthModal={openAuthModal}
        isLoggedIn={isLoggedIn}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onLoginSuccess={login}
      />
    </div>
  );
}
