import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink, Megaphone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface NativeAdProps {
  variant?: 'event-feed' | 'places' | 'profile' | 'event-detail';
  showPlaceholder?: boolean; // New prop to show placeholder ad
}

// Mock ad data - in production, these would come from an ad network
const mockAds = {
  'event-feed': [
    {
      id: 'ad-1',
      title: 'Ararat Restaurant',
      description: 'Authentic Armenian cuisine in the heart of LA. 20% off for HYE members.',
      imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop',
      sponsorName: 'Ararat Restaurant',
      ctaText: 'View Menu',
      ctaUrl: '#',
    },
    {
      id: 'ad-2',
      title: 'Armenian Wine Night',
      description: 'Discover premium Armenian wines. Join our tasting events every Friday.',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
      sponsorName: 'Vino Armenia',
      ctaText: 'Learn More',
      ctaUrl: '#',
    },
    {
      id: 'ad-3',
      title: 'Book Your Trip to Armenia',
      description: 'Exclusive deals on flights to Yerevan. Explore your heritage this summer.',
      imageUrl: 'https://images.unsplash.com/photo-1560718510-22e0fdde8f82?w=400&h=300&fit=crop',
      sponsorName: 'Armenian Travel Co',
      ctaText: 'Get Deals',
      ctaUrl: '#',
    },
  ],
  'places': [
    {
      id: 'ad-4',
      title: 'List Your Business on HYE',
      description: 'Reach thousands of Armenian community members. Feature your restaurant, cafe, or shop.',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      sponsorName: 'HYE Business',
      ctaText: 'Get Started',
      ctaUrl: '#',
    },
  ],
  'profile': [
    {
      id: 'ad-5',
      title: 'HYE Premium',
      description: 'Go ad-free and get early access to exclusive events. Support the community.',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
      sponsorName: 'HYE',
      ctaText: 'Upgrade Now',
      ctaUrl: '#',
    },
  ],
  'event-detail': [
    {
      id: 'ad-6',
      title: 'Sponsor HYE Events',
      description: 'Showcase your brand to the Armenian community. Custom sponsorship packages available.',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
      sponsorName: 'HYE Partnerships',
      ctaText: 'Partner With Us',
      ctaUrl: '#',
    },
  ],
};

export function NativeAd({ variant = 'event-feed', showPlaceholder = false }: NativeAdProps) {
  const navigate = useNavigate();
  const { isPremium } = useAuth();
  const ads = mockAds[variant];
  const ad = ads[Math.floor(Math.random() * ads.length)];

  // Don't show ads to premium users
  if (isPremium) {
    return null;
  }

  // Show placeholder ad if requested
  if (showPlaceholder) {
    return <PlaceholderAd />;
  }

  const handleAdClick = () => {
    // Track ad click
    console.log(`Ad clicked: ${ad.id}`);
    
    // Navigate to ad request page for "List Your Business" ad
    if (ad.id === 'ad-4') {
      navigate('/admin/request-ad');
      return;
    }
    
    // In production, this would:
    // 1. Send analytics event
    // 2. Track conversion
    // 3. Open ad URL
    if (ad.ctaUrl && ad.ctaUrl !== '#') {
      window.open(ad.ctaUrl, '_blank');
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{ad.sponsorName}</span>
                <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                  {ad.ctaText}
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </button>
      </CardContent>
    </Card>
  );
}

// Banner ad variant for between sections
export function BannerAd() {
  const navigate = useNavigate();
  const { isPremium } = useAuth();
  
  // Don't show ads to premium users
  if (isPremium) {
    return null;
  }
  
  const ad = {
    title: 'HYE Premium - Go Ad Free',
    description: 'Support the community and enjoy an ad-free experience',
    ctaText: 'Upgrade for $4.99/mo',
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm">{ad.title}</p>
              <Badge variant="outline" className="text-xs bg-white border-gray-300 text-gray-600">
                Ad
              </Badge>
            </div>
            <p className="text-xs text-gray-600">{ad.description}</p>
          </div>
          <button 
            onClick={() => navigate('/premium-upgrade')}
            className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            {ad.ctaText}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// Placeholder ad for when no ads are available
function PlaceholderAd() {
  const navigate = useNavigate();
  
  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <CardContent className="p-0">
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs text-gray-600 border-gray-300">
            Ad Space Available
          </Badge>
        </div>
        
        <button 
          onClick={() => navigate('/admin/request-ad')}
          className="w-full text-left hover:opacity-90 transition-opacity"
        >
          <div className="flex gap-3 p-4">
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-10 h-10 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="font-semibold mb-1 text-gray-800">Your Brand Here</h4>
              <p className="text-sm text-gray-600 mb-2">
                Advertise to thousands of community members. Premium ad placement available.
              </p>
              <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                Learn More
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </button>
      </CardContent>
    </Card>
  );
}