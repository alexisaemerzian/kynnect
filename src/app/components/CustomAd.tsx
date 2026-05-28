import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink } from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { useEthnicity } from '../context/EthnicityContext';

export function CustomAd() {
  const { getAdsByEthnicity } = useAdminData();
  const { selectedEthnicity } = useEthnicity();
  
  const ads = getAdsByEthnicity(selectedEthnicity?.id || '');
  
  // If no custom ads, don't show anything
  if (ads.length === 0) {
    return null;
  }
  
  // Randomly select an ad
  const ad = ads[Math.floor(Math.random() * ads.length)];

  const handleAdClick = () => {
    // Track ad click
    console.log(`Custom ad clicked: ${ad.id}`);
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank');
    }
  };

  return (
    <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <CardContent className="p-0">
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs text-gray-600 border-gray-300">
            Sponsored
          </Badge>
        </div>
        
        <button 
          onClick={handleAdClick}
          className="w-full text-left hover:opacity-95 transition-opacity"
        >
          <div className="flex gap-3 p-4">
            <img 
              src={ad.imageUrl} 
              alt={ad.title}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium mb-1 truncate">{ad.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {ad.description}
              </p>
              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                {ad.buttonText}
                {ad.linkUrl && <ExternalLink className="w-3 h-3" />}
              </div>
            </div>
          </div>
        </button>
      </CardContent>
    </Card>
  );
}
