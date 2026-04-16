import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const FeatureContext = createContext({});

export function useFeatures() {
  return useContext(FeatureContext);
}

export function FeatureProvider({ children }) {
  const [features, setFeatures] = useState({
    aiTutor: true,
    gamification: true,
    notifications: true,
    reviews: true,
    globalSearch: true,
    waitlist: true,
  });

  useEffect(() => {
    api.get('/features')
      .then(res => setFeatures(res.data))
      .catch(() => { /* defaults remain true */ });
  }, []);

  return (
    <FeatureContext.Provider value={features}>
      {children}
    </FeatureContext.Provider>
  );
}
