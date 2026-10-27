import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { guidelinesData } from '../data/guidelinesData';
import { templatesData } from '../data/templatesData';
import { journalsData } from '../data/journalsData';
import { DB_EVENT, getContent, saveContent } from '../services/mockDb';
import api from '../services/api';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [version, setVersion] = useState(0);

  const syncContent = useCallback(async () => {
    try {
      const [gRes, tRes, jRes] = await Promise.all([
        api.getContent('guidelines'),
        api.getContent('templates'),
        api.getContent('journals')
      ]);

      if (gRes.ok && Array.isArray(gRes.items) && gRes.items.length > 0) {
        saveContent('guidelines', gRes.items);
      }
      if (tRes.ok && Array.isArray(tRes.items) && tRes.items.length > 0) {
        saveContent('templates', tRes.items);
      }
      if (jRes.ok && Array.isArray(jRes.items) && jRes.items.length > 0) {
        saveContent('journals', jRes.items);
      }
    } catch (err) {
      console.warn('[Content] Error loading from MongoDB Atlas:', err.message);
    }
  }, []);

  useEffect(() => {
    syncContent();
  }, [syncContent]);

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
      journals: getContent('journals') || journalsData,
      syncContent
    }),
    [version, syncContent]
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
