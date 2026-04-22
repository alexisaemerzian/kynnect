import { useState } from 'react';
import { ethnicities } from '../config/ethnicities';
import { useEthnicity } from '../context/EthnicityContext';
import { Input } from '../components/ui/input';
import { Search, Globe2, Users, MapPin, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import logo from 'figma:asset/9dc64ec9ee5e9411aa01b1f219c699ee9d6d7ea4.png';

export function OnboardingPage() {
  const { setEthnicity, setMultipleEthnicities } = useEthnicity();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredEthnicities = ethnicities.filter(ethnicity =>
    ethnicity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleEthnicity = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleContinue = () => {
    if (selectedIds.length > 0) {
      // Set the first selected ethnicity as active, store all selected
      if (typeof setMultipleEthnicities === 'function') {
        setMultipleEthnicities(selectedIds);
      }
      setEthnicity(selectedIds[0]);
      navigate('/signup');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
            <img src={logo} alt="Kynnect Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Welcome to Kynnect</h1>
          <p className="text-gray-600 text-lg mb-1">
            Find your community, anywhere in the world
          </p>
          <p className="text-gray-500 text-sm">
            Select one or more ethnicities to connect with your communities
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search for your ethnicity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-white shadow-sm border-gray-300"
            />
          </div>
        </div>

        {/* Ethnicity Grid */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 max-h-[500px] overflow-y-auto">
          <p className="text-sm text-gray-600 mb-4">
            Select all that apply • {selectedIds.length} selected
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredEthnicities.map((ethnicity) => {
              const isSelected = selectedIds.includes(ethnicity.id);
              return (
                <button
                  key={ethnicity.id}
                  onClick={() => toggleEthnicity(ethnicity.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                    isSelected
                      ? 'border-black bg-gray-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{ethnicity.flag}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{ethnicity.name}</h3>
                      <p className="text-sm text-gray-600">{ethnicity.displayName}</p>
                    </div>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-black border-black'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{ethnicity.greeting}</p>
                </button>
              );
            })}
          </div>

          {filteredEthnicities.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No ethnicities found.</p>
              <p className="text-sm mt-1">Try a different search term.</p>
            </div>
          )}
        </div>

        {/* Request New Ethnicity */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Don't see your community?
          </p>
          <a
            href={`mailto:alexis@kynnect.net?subject=Request to Add New Ethnicity&body=Hi Kynnect Team,%0D%0A%0D%0AI would like to request the following ethnicity be added to Kynnect:%0D%0A%0D%0AEthnicity Name: %0D%0ADisplay Name: %0D%0AGreeting (in native language): %0D%0AFlag Emoji: %0D%0A%0D%0AAdditional Information:%0D%0A%0D%0A%0D%0AThank you!`}
            className="inline-flex items-center gap-2 text-black hover:text-gray-700 font-medium underline decoration-2 underline-offset-4 transition-colors"
          >
            Request our next addition
          </a>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={selectedIds.length === 0}
          className="w-full h-14 text-lg font-semibold bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {selectedIds.length === 0
            ? 'Select at least one community'
            : selectedIds.length === 1
            ? 'Continue to Community'
            : `Continue with ${selectedIds.length} Communities`}
        </Button>

        {/* Login Button */}
        <Button
          onClick={handleLoginClick}
          variant="outline"
          className="w-full h-12 text-base font-medium border-gray-300 hover:bg-gray-50"
        >
          <LogIn className="w-4 h-4 mr-2" />
          I Already Have an Account
        </Button>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-gray-700" />
            </div>
            <p className="text-xs font-medium text-gray-700">Connect</p>
            <p className="text-xs text-gray-500">Meet your people</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-gray-700" />
            </div>
            <p className="text-xs font-medium text-gray-700">Discover</p>
            <p className="text-xs text-gray-500">Find local spots</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-2">
              <Globe2 className="w-6 h-6 text-gray-700" />
            </div>
            <p className="text-xs font-medium text-gray-700">Travel</p>
            <p className="text-xs text-gray-500">Any city, any country</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          21+ only • Private community network
        </p>
      </div>
    </div>
  );
}