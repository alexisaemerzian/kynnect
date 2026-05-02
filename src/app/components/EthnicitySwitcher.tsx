import { useEthnicity } from '../context/EthnicityContext';
import { ethnicities } from '../config/ethnicities';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function EthnicitySwitcher() {
  const { selectedEthnicity, availableEthnicities, setEthnicity } = useEthnicity();
  const [isOpen, setIsOpen] = useState(false);

  // Filter to only show user's selected ethnicities
  const userEthnicities = ethnicities.filter(e => availableEthnicities.includes(e.id));

  // If user has only one ethnicity, don't show the switcher
  if (userEthnicities.length <= 1) {
    return null;
  }

  const handleSwitch = (ethnicityId: string) => {
    setEthnicity(ethnicityId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Current Ethnicity Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
      >
        <span className="text-2xl">{selectedEthnicity?.flag}</span>
        <span className="font-semibold text-white">{selectedEthnicity?.displayName}</span>
        <ChevronDown className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] z-50 overflow-hidden">
            {userEthnicities.map((ethnicity) => {
              const isSelected = selectedEthnicity?.id === ethnicity.id;
              return (
                <button
                  key={ethnicity.id}
                  onClick={() => handleSwitch(ethnicity.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-gray-100' : ''
                  }`}
                >
                  <span className="text-2xl">{ethnicity.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{ethnicity.name}</p>
                    <p className="text-xs text-gray-600">{ethnicity.displayName}</p>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-black rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
