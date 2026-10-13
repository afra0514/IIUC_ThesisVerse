import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Assalamu Alaikum! I am your IIUC ThesisVerse AI Assistant. How can I help with your thesis supervisor search, journal papers, or guidelines today?'
    }
  ]);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  const toggleChat = () => setIsChatOpen((prev) => !prev);

  const sendMessage = (text) => {
    if (!text || !text.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text.trim()
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let responseObj = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'I found matching research supervisors and guidelines for your query.'
      };

      if (lower.includes('nlp') || lower.includes('language') || lower.includes('bangla')) {
        responseObj = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Dr. Mohammad Mahmudul Hasan (Professor, Dept. of CSE) actively supervises research in Natural Language Processing and Bangla text processing.',
          recommendation: {
            name: 'Dr. Mohammad Mahmudul Hasan',
            designation: 'Professor, Dept. of CSE',
            papers: '64 Research Papers',
            link: '#supervisors'
          }
        };
      } else if (lower.includes('ieee') || lower.includes('paper') || lower.includes('journal')) {
        responseObj = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'You can explore peer-reviewed literature across IEEE Xplore, ScienceDirect, and Scopus using direct search portals.',
          journalLink: {
            title: 'IEEE Xplore Digital Library',
            url: 'https://ieeexplore.ieee.org'
          }
        };
      } else if (lower.includes('overleaf') || lower.includes('latex') || lower.includes('template')) {
        responseObj = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Official IIUC-formatted LaTeX packages and Word templates are available in the Download Templates section.',
          journalLink: {
            title: 'Download Templates Center',
            url: '#templates'
          }
        };
      } else {
        responseObj = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'You can explore our verified supervisor directory, browse defense evaluation rubrics, or download official thesis templates directly from the portal.'
        };
      }

      setMessages((prev) => [...prev, responseObj]);
    }, 700);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: 'Assalamu Alaikum! I am your IIUC ThesisVerse AI Assistant. How can I help with your thesis supervisor search, journal papers, or guidelines today?'
      }
    ]);
  };

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        openChat,
        closeChat,
        toggleChat,
        messages,
        sendMessage,
        clearChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}