'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CollectionsContextType {
  selectedCollectionId: number | null;
  setSelectedCollectionId: (id: number | null) => void;
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);

  return (
    <CollectionsContext.Provider value={{ selectedCollectionId, setSelectedCollectionId }}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
}
