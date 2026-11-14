import React, { createContext, useContext, useState, useCallback } from 'react';
import { CLINICAL_HELP_REGISTRY, ClinicalHelpItem } from '../data/clinicalHelpRegistry';

interface ClinicalHelpContextType {
  isHelpModalOpen: boolean;
  activeHelpItem: ClinicalHelpItem | null;
  openHelp: (idOrItem: string | ClinicalHelpItem) => void;
  closeHelp: () => void;
  registry: Record<string, ClinicalHelpItem>;
  onNavigateToTab?: (tabId: string) => void;
  setNavigateHandler: (handler: (tabId: string) => void) => void;
}

const ClinicalHelpContext = createContext<ClinicalHelpContextType | undefined>(undefined);

export const ClinicalHelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [activeHelpItem, setActiveHelpItem] = useState<ClinicalHelpItem | null>(null);
  const [navigateHandler, setNavigateHandlerState] = useState<((tabId: string) => void) | undefined>(undefined);

  const openHelp = useCallback((idOrItem: string | ClinicalHelpItem) => {
    if (typeof idOrItem === 'string') {
      const found = CLINICAL_HELP_REGISTRY[idOrItem];
      if (found) {
        setActiveHelpItem(found);
        setIsHelpModalOpen(true);
      } else {
        console.warn(`[ClinicalHelp] Item not found for id: "${idOrItem}"`);
      }
    } else {
      setActiveHelpItem(idOrItem);
      setIsHelpModalOpen(true);
    }
  }, []);

  const closeHelp = useCallback(() => {
    setIsHelpModalOpen(false);
  }, []);

  const setNavigateHandler = useCallback((handler: (tabId: string) => void) => {
    setNavigateHandlerState(() => handler);
  }, []);

  return (
    <ClinicalHelpContext.Provider
      value={{
        isHelpModalOpen,
        activeHelpItem,
        openHelp,
        closeHelp,
        registry: CLINICAL_HELP_REGISTRY,
        onNavigateToTab: navigateHandler,
        setNavigateHandler
      }}
    >
      {children}
    </ClinicalHelpContext.Provider>
  );
};

export const useClinicalHelp = () => {
  const context = useContext(ClinicalHelpContext);
  if (!context) {
    throw new Error('useClinicalHelp must be used within a ClinicalHelpProvider');
  }
  return context;
};
