import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethnicities as ethnicityConfigs, EthnicityConfig } from '../config/ethnicities';

export interface Ethnicity {
  id: string;
  name: string;
  displayName: string;
  flag: string;
  greeting: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
}

interface EthnicityContextType {
  selectedEthnicity: Ethnicity | null;
  setEthnicity: (ethnicityId: string) => void;
  availableEthnicities: string[];
  setMultipleEthnicities: (ethnicityIds: string[]) => void;
}

const EthnicityContext = createContext<EthnicityContextType | undefined>(undefined);

export function EthnicityProvider({ children }: { children: ReactNode }) {
  const [selectedEthnicity, setSelectedEthnicity] = useState<Ethnicity | null>(null);
  const [availableEthnicities, setAvailableEthnicities] = useState<string[]>([]);

  // Helper function to add ethnicity to URL hash
  const addEthnicityToUrl = (ethnicityId: string) => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    hashParams.set('eth', ethnicityId);
    window.location.hash = hashParams.toString();
  };

  // Helper function to fetch ethnicity from config (not database)
  const fetchEthnicity = (ethnicityId: string) => {
    const config = ethnicityConfigs.find(e => e.id === ethnicityId);
    
    if (!config) {
      console.error('Ethnicity not found:', ethnicityId);
      return;
    }

    // Convert config to Ethnicity type
    const ethnicity: Ethnicity = {
      id: config.id,
      name: config.name,
      displayName: config.displayName,
      flag: config.flag,
      greeting: config.greeting,
      tagline: config.tagline,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      isActive: true,
    };

    setSelectedEthnicity(ethnicity);
  };

  useEffect(() => {
    console.log('🌍 EthnicityContext mounted');
    
    // FIRST: Check URL hash for ethnicity (survives refreshes in Figma Make)
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.substring(1)); // Remove the '#'
    const ethnicityFromHash = hashParams.get('eth');
    
    if (ethnicityFromHash) {
      console.log('🔗 Found ethnicity in URL hash:', ethnicityFromHash);
      fetchEthnicity(ethnicityFromHash);
      // Also save to localStorage as backup
      localStorage.setItem('selectedEthnicity', ethnicityFromHash);
      return;
    }
    
    // SECOND: Check localStorage
    const storedEthnicityId = localStorage.getItem('selectedEthnicity');
    if (storedEthnicityId) {
      console.log('💾 Found ethnicity in localStorage:', storedEthnicityId);
      fetchEthnicity(storedEthnicityId);
      // Add to URL hash for persistence
      addEthnicityToUrl(storedEthnicityId);
    }

    // Listen for storage changes (triggered on login)
    const handleStorageChange = () => {
      const ethnicityId = localStorage.getItem('selectedEthnicity');
      if (ethnicityId) {
        fetchEthnicity(ethnicityId);
        addEthnicityToUrl(ethnicityId);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setEthnicity = (ethnicityId: string) => {
    fetchEthnicity(ethnicityId);
    localStorage.setItem('selectedEthnicity', ethnicityId);
    addEthnicityToUrl(ethnicityId);
  };

  const setMultipleEthnicities = (ethnicityIds: string[]) => {
    setAvailableEthnicities(ethnicityIds);
    localStorage.setItem('availableEthnicities', JSON.stringify(ethnicityIds));

    // Set the first ethnicity as selected
    if (ethnicityIds.length > 0) {
      setEthnicity(ethnicityIds[0]);
    }
  };

  // Load available ethnicities on mount
  useEffect(() => {
    const stored = localStorage.getItem('availableEthnicities');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setAvailableEthnicities(parsed);
        }
      } catch (error) {
        console.error('Failed to parse available ethnicities:', error);
      }
    }
  }, []);

  return (
    <EthnicityContext.Provider value={{ selectedEthnicity, setEthnicity, availableEthnicities, setMultipleEthnicities }}>
      {children}
    </EthnicityContext.Provider>
  );
}

export function useEthnicity() {
  const context = useContext(EthnicityContext);
  if (context === undefined) {
    throw new Error('useEthnicity must be used within an EthnicityProvider');
  }
  return context;
}