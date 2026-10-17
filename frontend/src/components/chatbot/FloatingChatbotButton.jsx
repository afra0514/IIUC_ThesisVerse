import React from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { useChat } from '../../context/ChatContext';
import '../../styles/chatbot/FloatingChatbotButton.css';

export default function FloatingChatbotButton({ onOpenAuthModal, isLoggedIn }) {
  const { isChatOpen: isOpen, toggleChat, closeChat } = useChat();

  const handleToggle = () => {
    if (!isLoggedIn) {
      onOpenAuthModal();
    } else {
      toggleChat();
    }
  };

  return (
    <div className="floating-chatbot-root">
      
       {isOpen && isLoggedIn && (
        <ChatWindow onClose={closeChat} />
      )}

       <button
        type="button"
        className="floating-bot-trigger-btn"
        onClick={handleToggle}
        aria-label="Open AI Research Assistant"
      >
        {isOpen && isLoggedIn ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            <div className="bot-sparkle-pill-badge">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </>
        )}
      </button>

    </div>
  );
}