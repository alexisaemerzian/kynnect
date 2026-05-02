import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ad, EventPromotion, SponsoredEventAd } from '../types/admin';

interface AdminDataContextType {
  ads: Ad[];
  promotions: EventPromotion[];
  sponsoredEventAds: SponsoredEventAd[];
  addAd: (ad: Omit<Ad, 'id' | 'createdAt'>) => void;
  updateAd: (id: string, ad: Partial<Ad>) => void;
  deleteAd: (id: string) => void;
  addPromotion: (promotion: Omit<EventPromotion, 'id' | 'createdAt'>) => void;
  updatePromotionStatus: (id: string, status: 'approved' | 'rejected') => void;
  addSponsoredEventAd: (sponsoredAd: Omit<SponsoredEventAd, 'id' | 'createdAt'>) => void;
  updateSponsoredEventAd: (id: string, sponsoredAd: Partial<SponsoredEventAd>) => void;
  deleteSponsoredEventAd: (id: string) => void;
  getAdsByEthnicity: (ethnicityId: string) => Ad[];
  getAdsByEthnicityAndCity: (ethnicityId: string, city?: string) => Ad[];
  getPromotionsByEthnicity: (ethnicityId: string) => EventPromotion[];
  getSponsoredEventAdsByEthnicity: (ethnicityId: string) => SponsoredEventAd[];
  getApprovedPromotedEventIds: (ethnicityId: string) => string[];
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [promotions, setPromotions] = useState<EventPromotion[]>([]);
  const [sponsoredEventAds, setSponsoredEventAds] = useState<SponsoredEventAd[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedAds = localStorage.getItem('adminAds');
    const storedPromotions = localStorage.getItem('adminPromotions');
    const storedSponsoredAds = localStorage.getItem('adminSponsoredEventAds');
    
    if (storedAds) {
      setAds(JSON.parse(storedAds));
    }
    if (storedPromotions) {
      setPromotions(JSON.parse(storedPromotions));
    }
    if (storedSponsoredAds) {
      setSponsoredEventAds(JSON.parse(storedSponsoredAds));
    }
  }, []);

  // Save ads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('adminAds', JSON.stringify(ads));
  }, [ads]);

  // Save promotions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('adminPromotions', JSON.stringify(promotions));
  }, [promotions]);

  // Save sponsored event ads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('adminSponsoredEventAds', JSON.stringify(sponsoredEventAds));
  }, [sponsoredEventAds]);

  const addAd = (ad: Omit<Ad, 'id' | 'createdAt'>) => {
    const newAd: Ad = {
      ...ad,
      id: `ad-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAds(prev => [...prev, newAd]);
  };

  const updateAd = (id: string, updates: Partial<Ad>) => {
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, ...updates } : ad));
  };

  const deleteAd = (id: string) => {
    setAds(prev => prev.filter(ad => ad.id !== id));
  };

  const addPromotion = (promotion: Omit<EventPromotion, 'id' | 'createdAt'>) => {
    const newPromotion: EventPromotion = {
      ...promotion,
      id: `promo-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPromotions(prev => [...prev, newPromotion]);
  };

  const updatePromotionStatus = (id: string, status: 'approved' | 'rejected') => {
    setPromotions(prev => prev.map(promo => 
      promo.id === id 
        ? { ...promo, status, approvedAt: status === 'approved' ? new Date().toISOString() : undefined }
        : promo
    ));
  };

  const addSponsoredEventAd = (sponsoredAd: Omit<SponsoredEventAd, 'id' | 'createdAt'>) => {
    const newSponsoredAd: SponsoredEventAd = {
      ...sponsoredAd,
      id: `sponsored-ad-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSponsoredEventAds(prev => [...prev, newSponsoredAd]);
  };

  const updateSponsoredEventAd = (id: string, updates: Partial<SponsoredEventAd>) => {
    setSponsoredEventAds(prev => prev.map(ad => ad.id === id ? { ...ad, ...updates } : ad));
  };

  const deleteSponsoredEventAd = (id: string) => {
    setSponsoredEventAds(prev => prev.filter(ad => ad.id !== id));
  };

  const getAdsByEthnicity = (ethnicityId: string) => {
    return ads.filter(ad => ad.ethnicityId === ethnicityId && ad.active);
  };

  const getAdsByEthnicityAndCity = (ethnicityId: string, city?: string) => {
    return ads.filter(ad => {
      // Must be active and match ethnicity
      if (!ad.active || ad.ethnicityId !== ethnicityId) return false;
      
      // Main ads show to all users of this ethnicity (regardless of city)
      if (ad.adType === 'main') return true;
      
      // Local ads only show if city matches
      if (ad.adType === 'local' && city) {
        return ad.city?.toLowerCase() === city.toLowerCase();
      }
      
      return false;
    });
  };

  const getPromotionsByEthnicity = (ethnicityId: string) => {
    return promotions.filter(promo => promo.ethnicityId === ethnicityId);
  };

  const getSponsoredEventAdsByEthnicity = (ethnicityId: string) => {
    return sponsoredEventAds.filter(ad => ad.ethnicityId === ethnicityId && ad.active);
  };

  const getApprovedPromotedEventIds = (ethnicityId: string) => {
    return promotions
      .filter(promo => promo.ethnicityId === ethnicityId && promo.status === 'approved')
      .map(promo => promo.eventId);
  };

  return (
    <AdminDataContext.Provider value={{
      ads,
      promotions,
      sponsoredEventAds,
      addAd,
      updateAd,
      deleteAd,
      addPromotion,
      updatePromotionStatus,
      addSponsoredEventAd,
      updateSponsoredEventAd,
      deleteSponsoredEventAd,
      getAdsByEthnicity,
      getAdsByEthnicityAndCity,
      getPromotionsByEthnicity,
      getSponsoredEventAdsByEthnicity,
      getApprovedPromotedEventIds,
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}