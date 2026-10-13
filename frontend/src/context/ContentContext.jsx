import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { guidelinesData } from '../data/guidelinesData';
import { templatesData } from '../data/templatesData';
import { journalsData } from '../data/journalsData';
import { DB_EVENT, getContent } from '../services/mockDb';

const ContentContext = createContext(null);
 
export function ContentProvider({ children }) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener('storage', bump);
    window.addEventListener(DB_EVENT, bump);
    return () => {
      window.removeEventListener('storage', bump);
      window.removeEventListener(DB_EVENT, bump);
    };
  }, []);

  const value = useMemo(
    () => ({
      guidelines: getContent('guidelines') || guidelinesData,
      templates: getContent('templates') || templatesData,
      journals: getContent('journals') || journalsData
    }),
    [version]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
