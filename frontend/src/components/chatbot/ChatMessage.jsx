import React from 'react';
import { Bot, User, ExternalLink, ArrowRight } from 'lucide-react';
import '../../styles/chatbot/ChatMessage.css';

export default function ChatMessage({ message }) {
  const isBot = message.sender === 'bot';

  return (
    <div className={`chat-message-row ${isBot ? 'bot-row' : 'user-row'}`}>
      
       <div className={`chat-avatar-icon ${isBot ? 'bot-avatar' : 'user-avatar'}`}>
        {isBot ? (
          <Bot className="w-3.5 h-3.5 text-white" />
        ) : (
          <User className="w-3.5 h-3.5 text-white" />
        )}
      </div>

       <div className={`chat-bubble-box ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
        <p className="chat-bubble-text">{message.text}</p>

         {message.recommendation && (
          <div className="embedded-recommendation-card">
            <div className="rec-info">
              <span className="rec-name">{message.recommendation.name}</span>
              <span className="rec-dept">{message.recommendation.designation}</span>
              <span className="rec-papers-badge">{message.recommendation.papers}</span>
            </div>
            <a href={message.recommendation.link} className="rec-view-link">
              <span>View Profile</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}

         {message.journalLink && (
          <a
            href={message.journalLink.url}
            target="_blank"
            rel="noreferrer"
            className="embedded-journal-link"
          >
            <span>{message.journalLink.title}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

    </div>
  );
}