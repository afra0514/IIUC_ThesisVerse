import React from 'react';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { ContentProvider } from './context/ContentContext';
import { ChatProvider } from './context/ChatContext';

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <ContentProvider>
          <ChatProvider>
            <div className="w-full min-h-screen flex flex-col">
              <Home />
            </div>
          </ChatProvider>
        </ContentProvider>
      </AppDataProvider>
    </AuthProvider>
  );
}
