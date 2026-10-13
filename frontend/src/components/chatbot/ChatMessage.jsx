import React from 'react';
import { Bot, User, ExternalLink, ArrowRight } from 'lucide-react';
import '../../styles/chatbot/ChatMessage.css';

function linkProps(url) {
  return url.startsWith('#') ? { href: url } : { href: url, target: '_blank', rel: 'noopener noreferrer' };
}

export default function ChatMessage({ message }) {
  const isBot = message.sender === 'bot';

  const recommendations = message.recommendations || (message.recommendation ? [message.recommendation] : []);
  const links = message.links || (message.journalLink ? [message.journalLink] : []);

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
        {message.bullets && (
          <ul className="chat-bullet-list">
            {message.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {recommendations.map((rec) => (
          <div key={rec.name} className="embedded-recommendation-card">
            <div className="rec-info">
              <span className="rec-name">{rec.name}</span>
              <span className="rec-dept">{rec.designation}</span>
              {rec.papers && <span className="rec-papers-badge">{rec.papers}</span>}
            </div>
            <a href={rec.link} className="rec-view-link">
              <span>View in Supervisor Directory</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        ))}

        {links.length > 0 && (
          <div className="chat-link-list">
            {links.map((link) => (
              <a key={link.url} {...linkProps(link.url)} className="embedded-journal-link">
                <span>{link.title}</span>
                {!link.url.startsWith('#') && <ExternalLink className="w-3 h-3" />}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
