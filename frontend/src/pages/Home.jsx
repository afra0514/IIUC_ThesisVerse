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
import SupervisorDashboard from '../components/dashboard/SupervisorDashboard';
import ProfileSettingsModal from '../components/profile/ProfileSettingsModal';

import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import '../styles/pages/Home.css';

const SAVED_KEY = 'iiuc_thesis_saved';

export default function Home() {
  let authContext = {};
  let chatContext = {};

  try {
    authContext = useAuth();
  } catch (err) {
    authContext = {};
  }

  try {
    chatContext = useChat();
  } catch (err) {
    chatContext = {};
  }

  const isLoggedIn = authContext.isLoggedIn || false;
  const user = authContext.user || null;
  const isStudent = user?.role === 'student';
  const userId = user?.id || null;
  const openChat = chatContext.openChat || (() => {});

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleOpenAuth = () => {
    setIsAuthOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthOpen(false);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) setIsSettingsOpen(false);
  }, [isLoggedIn]);
 
  const [savedItems, setSavedItems] = useState([]);
  const [savedOwner, setSavedOwner] = useState(null);

  useEffect(() => {
    if (!userId) {
      setSavedItems([]);
      setSavedOwner(null);
      return;
    }
    try {
      const raw = localStorage.getItem(`${SAVED_KEY}_${userId}`);
      const parsed = raw ? JSON.parse(raw) : [];
      setSavedItems(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      setSavedItems([]);
    }
    setSavedOwner(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId || savedOwner !== userId) return;
    try {
      localStorage.setItem(`${SAVED_KEY}_${userId}`, JSON.stringify(savedItems));
    } catch (err) {
    }
  }, [savedItems, savedOwner, userId]);

  const savedKeys = savedItems.map((i) => i.key);

  const handleToggleSave = (item) => {
    setSavedItems((prev) =>
      prev.some((i) => i.key === item.key)
        ? prev.filter((i) => i.key !== item.key)
        : [...prev, item]
    );
  };

  const [heroSearch, setHeroSearch] = useState({ text: '', nonce: 0 });

  const handleHeroSearch = (query) => {
    if (!isLoggedIn) {
      handleOpenAuth();
      return;
    }
    setHeroSearch({ text: typeof query === 'string' ? query.trim() : '', nonce: Date.now() });
    const supervisorSection = document.getElementById('supervisors');
    if (supervisorSection) {
      supervisorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page-root">
      
      <Navbar onOpenAuthModal={handleOpenAuth} onOpenSettings={() => setIsSettingsOpen(true)} />

      <Hero
        onSearch={handleHeroSearch}
        onSelectTopic={handleHeroSearch}
        onOpenAuthModal={handleOpenAuth}
        isLoggedIn={isLoggedIn}
      />

      {isLoggedIn && isStudent && (
        <StudentDashboard
          user={user}
          savedItems={savedItems}
          onToggleSave={handleToggleSave}
        />
      )}

      {isLoggedIn && !isStudent && <SupervisorDashboard user={user} />}

      <SupervisorSection
        onOpenAuthModal={handleOpenAuth}
        isLoggedIn={isLoggedIn}
        savedKeys={savedKeys}
        onToggleSave={isStudent ? handleToggleSave : undefined}
        externalSearch={heroSearch}
      />

      <GuidelinesSection
        onOpenAuthModal={handleOpenAuth}
        isLoggedIn={isLoggedIn}
      />

      <JournalSection
        onOpenAuthModal={handleOpenAuth}
        isLoggedIn={isLoggedIn}
        savedKeys={savedKeys}
        onToggleSave={isStudent ? handleToggleSave : undefined}
        searchKeyword={heroSearch.text}
      />

      <TemplateSection
        onOpenAuthModal={handleOpenAuth}
        isLoggedIn={isLoggedIn}
        savedKeys={savedKeys}
        onToggleSave={isStudent ? handleToggleSave : undefined}
      />

      <AiAssistantBanner
        onOpenChatbot={openChat}
        onOpenAuthModal={handleOpenAuth}
        isLoggedIn={isLoggedIn}
      />

      <AboutAndContactSection />

      <Footer onOpenAuthModal={handleOpenAuth} isLoggedIn={isLoggedIn} />

      <FloatingChatbotButton
        onOpenAuthModal={handleOpenAuth}
        isLoggedIn={isLoggedIn}
      />

      {isLoggedIn && isSettingsOpen && (
        <ProfileSettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}