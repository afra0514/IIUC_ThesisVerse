import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, ChevronDown, Search, Bell, LogOut, Settings } from 'lucide-react';
import FeaturesDropdown from './FeaturesDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { getFirstName } from '../../utils/format';
import '../../styles/navbar/Navbar.css';

export default function Navbar({ onOpenAuthModal, onOpenSettings }) {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const { isLoggedIn, user, logout } = useAuth();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAppData();

  const firstName = getFirstName(user?.name || 'User');
  const initial = firstName.charAt(0).toUpperCase();

  // close the notification panel when clicking outside it
  useEffect(() => {
    const onDown = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const handleAuthTrigger = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onOpenAuthModal === 'function') {
      onOpenAuthModal();
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        
        {/* Left Side: Brand Logo */}
        <a href="#home" className="navbar-logo-link">
          <div className="navbar-logo-icon">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="navbar-brand-text">
            <span className="brand-prefix">IIUC </span>
            <span className="brand-suffix">ThesisVerse</span>
          </div>
        </a>

        {/* Center: Navigation Links */}
        <nav className="navbar-links">
          <a href="#home" className="nav-item">Home</a>
          <a href="#about-us" className="nav-item">About Us</a>
          <a href="#contact-us" className="nav-item">Contact Us</a>
          
          {/* Features Dropdown Menu */}
          <div 
            className="dropdown-wrapper"
            onMouseEnter={() => setIsFeaturesOpen(true)}
            onMouseLeave={() => setIsFeaturesOpen(false)}
          >
            <button 
              type="button"
              className="nav-item dropdown-btn"
              onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
            >
              <span>Features</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFeaturesOpen ? 'rotate-180 text-emerald-600' : ''}`} />
            </button>

            {isFeaturesOpen && (
              <FeaturesDropdown
                isLoggedIn={isLoggedIn}
                onSelectFeature={isLoggedIn ? () => setIsFeaturesOpen(false) : handleAuthTrigger}
              />
            )}
          </div>
        </nav>

        {/* Right Side */}
        {isLoggedIn ? (
          <div className="navbar-right-actions">

            {/* Notifications */}
            <div className="notif-wrapper" ref={notifRef}>
              <button
                type="button"
                className="icon-action-btn"
                onClick={() => setIsNotifOpen((open) => !open)}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {isNotifOpen && (
                <NotificationsDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onRead={markNotificationRead}
                  onMarkAllRead={markAllNotificationsRead}
                  onClose={() => setIsNotifOpen(false)}
                />
              )}
            </div>

            {/* Profile chip opens profile settings */}
            <button
              type="button"
              className="navbar-user-chip"
              onClick={onOpenSettings}
              title="Profile settings"
            >
              <div className="navbar-user-avatar">{initial}</div>
              <span className="navbar-user-name">{firstName}</span>
            </button>

            <button
              type="button"
              className="logout-icon-btn"
              onClick={onOpenSettings}
              aria-label="Profile settings"
              title="Profile settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="logout-icon-btn"
              onClick={logout}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="navbar-right-actions">
            
            {/* Global Search Trigger Bar */}
            <div 
              className="search-pill-container" 
              onClick={handleAuthTrigger}
              role="button"
              tabIndex={0}
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="search-placeholder">Search</span>
              <span className="search-shortcut">
                <kbd>Ctrl</kbd>
                <kbd>K</kbd>
              </span>
            </div>

            {/* Notification Bell Icon */}
            <button 
              type="button"
              className="icon-action-btn"
              onClick={handleAuthTrigger}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              <span className="notification-dot"></span>
            </button>

            {/* Student Login / Register CTA Button */}
            <button 
              type="button" 
              className="login-register-btn"
              onClick={handleAuthTrigger}
            >
              Login / Register
            </button>

          </div>
        )}

      </div>
    </header>
  );
}
