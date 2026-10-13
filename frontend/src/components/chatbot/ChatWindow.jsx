import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import '../../styles/chatbot/ChatWindow.css';

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Assalamu Alaikum! I am your IIUC ThesisVerse AI Assistant. How can I help with your thesis supervisor search, journal papers, or guidelines today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'Recommend NLP Supervisor',
    'How to find IEEE papers?',
    'How to use Overleaf?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Mock AI intelligent response logic
    setTimeout(() => {
      let botResponse = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Based on IIUC records, Dr. Mohammad Mahmudul Hasan (Professor, Dept. of CSE) is a leading expert in NLP and Machine Learning with 64 published papers.',
        recommendation: {
          name: 'Dr. Mohammad Mahmudul Hasan',
          designation: 'Professor, Dept. of CSE',
          papers: '64 Research Papers',
          link: '#supervisors'
        }
      };

      if (text.toLowerCase().includes('ieee') || text.toLowerCase().includes('paper')) {
        botResponse = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'You can search high-impact conference and journal papers directly on IEEE Xplore and ScienceDirect using the portal links below.',
          journalLink: {
            title: 'IEEE Xplore Digital Library',
            url: 'https://ieeexplore.ieee.org'
          }
        };
      }

      setMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  return (
    <div className="chat-window-container">
      
      {/* Header */}
      <div className="chat-window-header">
        <div className="chat-header-info">
          <div className="chat-header-bot-circle">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="chat-header-title">ThesisVerse AI Assistant</h4>
            <div className="chat-status-row">
              <span className="online-indicator-dot"></span>
              <span className="online-status-text">Active &amp; Ready</span>
            </div>
          </div>
        </div>

        <button type="button" className="chat-header-close-btn" onClick={onClose}>
          <X className="w-4 h-4 text-slate-300 hover:text-white" />
        </button>
      </div>

       <div className="chat-messages-area">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

       <div className="chat-suggestion-chips-row">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className="suggestion-chip-btn"
            onClick={() => handleSend(prompt)}
          >
            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

       <form
        className="chat-input-wrapper"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          className="chat-input-field"
          placeholder="Ask a question about supervisors or papers..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button type="submit" className="chat-send-btn" disabled={!inputMessage.trim()}>
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>

    </div>
  );
}