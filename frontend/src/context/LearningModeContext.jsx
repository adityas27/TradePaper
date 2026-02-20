import { createContext, useContext, useEffect, useState } from 'react';

const LearningModeContext = createContext();

export function LearningModeProvider({ children }) {
  const [learningMode, setLearningMode] = useState(() => {
    const stored = localStorage.getItem('learningMode');
    return stored !== null ? stored === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('learningMode', learningMode);
  }, [learningMode]);

  const toggleLearningMode = () => {
    setLearningMode((prev) => !prev);
  };

  return (
    <LearningModeContext.Provider value={{ learningMode, toggleLearningMode }}>
      {children}
    </LearningModeContext.Provider>
  );
}

export function useLearningMode() {
  const context = useContext(LearningModeContext);
  if (!context) {
    throw new Error('useLearningMode must be used within LearningModeProvider');
  }
  return context;
}
