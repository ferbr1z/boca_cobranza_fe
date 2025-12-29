import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

const LOCAL_STORAGE_KEY = 'selectedLocalId';

interface LocalFilterContextType {
  selectedLocalId: number | null;
  setSelectedLocalId: (localId: number | null) => void;
  clearSelectedLocalId: () => void;
}

const LocalFilterContext = createContext<LocalFilterContextType | undefined>(undefined);

interface LocalFilterProviderProps {
  children: ReactNode;
}

const getInitialLocalId = (): number | null => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : null;
  } catch (error) {
    console.error('Error al leer localStorage:', error);
    return null;
  }
};

export const LocalFilterProvider: React.FC<LocalFilterProviderProps> = ({ children }) => {
  const [selectedLocalId, setSelectedLocalIdState] = useState<number | null>(getInitialLocalId);

  useEffect(() => {
    try {
      if (selectedLocalId !== null) {
        localStorage.setItem(LOCAL_STORAGE_KEY, selectedLocalId.toString());
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }, [selectedLocalId]);

  const setSelectedLocalId = useCallback((localId: number | null) => {
    setSelectedLocalIdState(localId);
  }, []);

  const clearSelectedLocalId = useCallback(() => {
    setSelectedLocalIdState(null);
  }, []);

  return (
    <LocalFilterContext.Provider value={{ selectedLocalId, setSelectedLocalId, clearSelectedLocalId }}>
      {children}
    </LocalFilterContext.Provider>
  );
};

export const useLocalFilter = (): LocalFilterContextType => {
  const context = useContext(LocalFilterContext);
  if (!context) {
    throw new Error('useLocalFilter must be used within a LocalFilterProvider');
  }
  return context;
};
