import React from 'react';
import { Lock, Bot, Sparkles, MessageSquare } from 'lucide-react';
import '../../styles/aiAssistantBanner/AiAssistantBanner.css';

export default function AiAssistantBanner({ onOpenChatbot, onOpenAuthModal, isLoggedIn }) {
  const handleClick = () => {
    if (!isLoggedIn) {
      onOpenAuthModal();
    } else {
      onOpenChatbot();
    }
  };

  return (
    <section className="ai-banner-section" id="ai-assistant">
      <div className="ai-banner-container">
        
        {/* Section Header */}
        <div className="ai-banner-header-wrapper">
          <div>
            <span className="ai-banner-feature-tag">FEATURE 05</span>
            <h2 className="ai-banner-main-title">AI Research Assistant</h2>
            <p className="ai-banner-subtitle">
              Ask for supervisor recommendations, journal links and guideline answers in plain language.
            </p>
          </div>

          {!isLoggedIn && (
            <div className="preview-lock-badge">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Preview Only - Login to Access</span>
            </div>
          )}
        </div>

        <div className="ai-assistant-card">
          <div className="ai-card-left-content">
            
            <div className="ai-avatar-badge-wrapper">
              <div className="ai-bot-circle">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="ai-sparkle-badge">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="ai-card-text-block">
              <h3 className="ai-assistant-title">ThesisVerse AI Assistant</h3>
              <p className="ai-sample-prompts">
                &quot;Who supervises Blockchain?&quot; · &quot;Papers on IoT&quot; · &quot;Final defense tips&quot;
              </p>
            </div>

          </div>

          <button
            type="button"
            className="ai-start-convo-btn"
            onClick={handleClick}
          >
            <MessageSquare className="w-4 h-4 text-[#0F172A]" />
            <span>Start a conversation</span>
          </button>
        </div>

      </div>
    </section>
  );
}