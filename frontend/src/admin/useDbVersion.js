import { useState, useEffect } from 'react';
import { DB_EVENT } from '../services/mockDb';

export default function useDbVersion() {
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
  return version;
}
