import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useChat } from '../../context/ChatContext';
import '../../styles/chatbot/ChatWindow.css';

const QUICK_PROMPTS = [
  'Who works on IoT?',
  'Papers on computer vision',
  'Which templates are available?',
  'How is the defense marked?'
];

export default function ChatWindow({ onClose }) {
  const { messages, isTyping, sendMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;
    sendMessage(text);
    setInputMessage('');
  };

  return (
    <div className="chat-window-container" role="dialog" aria-label="ThesisVerse assistant">
      <div className="chat-window-header">
        <div className="chat-header-info">
          <div className="chat-header-bot-circle">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="chat-header-title">ThesisVerse AI Assistant</h4>
            <div className="chat-status-row">
              <span className="online-indicator-dot"></span>
              <span className="online-status-text">Answers from portal data</span>
            </div>
          </div>
        </div>
        <button type="button" className="chat-header-close-btn" onClick={onClose} aria-label="Close assistant">
          <X className="w-4 h-4 text-slate-300 hover:text-white" />
        </button>
      </div>
      <div className="chat-messages-area" aria-live="polite">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="chat-typing-row">
            <span className="chat-typing-dot"></span>
            <span className="chat-typing-dot"></span>
            <span className="chat-typing-dot"></span>
            <span className="sr-only">The assistant is typing</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-suggestion-chips-row">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
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
        <label htmlFor="chat-input" className="sr-only">Your question</label>
        <input
          id="chat-input"
          ref={inputRef}
          type="text"
          className="chat-input-field"
          placeholder="Ask a question about supervisors or papers..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button type="submit" className="chat-send-btn" disabled={!inputMessage.trim()} aria-label="Send">
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}
