import { supabase } from './supabase';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ============================================
// ADMIN & ADS MANAGEMENT
// ============================================

export type AdStatus = 'active' | 'paused' | 'archived';
export type PromotionStatus = 'pending' | 'approved' | 'rejected';
export type PromotionPackage = 'basic' | 'standard' | 'premium';

// ============================================
// ADS (Native Advertising)
// ============================================

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sponsorName: string;
  ctaText: string;
  ctaUrl: string;
  ethnicityId: string;
  city?: string;
  adType: 'main' | 'local'; // main = universal, local = city-specific
  status: AdStatus;
  startDate?: string; // When ad starts showing
  endDate?: string; // When ad expires
  impressions: number;
  clicks: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export async function createAd(
  adData: {
    title: string;
    description: string;
    imageUrl: string;
    sponsorName: string;
    ctaText: string;
    ctaUrl: string;
    ethnicityId: string;
    city?: string;
    adType: 'main' | 'local';
    startDate?: string;
    endDate?: string;
  },
  userId: string
): Promise<{ ad: Ad | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .insert({
        title: adData.title,
        description: adData.description,
        image_url: adData.imageUrl,
        sponsor_name: adData.sponsorName,
        cta_text: adData.ctaText,
        cta_url: adData.ctaUrl,
        ethnicity_id: adData.ethnicityId,
        city: adData.city,
        ad_type: adData.adType,
        start_date: adData.startDate,
        end_date: adData.endDate,
        status: 'active',
        impressions: 0,
        clicks: 0,
        created_by_id: userId,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Create ad error:', error);
      return { ad: null, error: 'Failed to create ad' };
    }
    
    return { ad: data as unknown as Ad, error: null };
  } catch (error) {
    console.error('Unexpected error creating ad:', error);
    return { ad: null, error: 'An unexpected error occurred' };
  }
}

export async function getAds(
  filters?: {
    ethnicityId?: string;
    city?: string;
    status?: AdStatus;
  }
): Promise<{ ads: Ad[]; error: string | null }> {
  try {
    let query = supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters?.ethnicityId) {
      query = query.eq('ethnicity_id', filters.ethnicityId);
    }
    
    if (filters?.city) {
      query = query.eq('city', filters.city);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      // Default to active ads only
      query = query.eq('status', 'active');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Get ads error:', error);
      return { ads: [], error: 'Failed to load ads' };
    }
    
    const ads: Ad[] = (data || []).map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      imageUrl: a.image_url,
      sponsorName: a.sponsor_name,
      ctaText: a.cta_text,
      ctaUrl: a.cta_url,
      ethnicityId: a.ethnicity_id,
      city: a.city,
      adType: a.ad_type,
      status: a.status,
      startDate: a.start_date,
      endDate: a.end_date,
      impressions: a.impressions,
      clicks: a.clicks,
      createdById: a.created_by_id,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));
    
    return { ads, error: null };
  } catch (error) {
    console.error('Unexpected error getting ads:', error);
    return { ads: [], error: 'An unexpected error occurred' };
  }
}

export async function updateAd(
  adId: string,
  updates: Partial<{
    title: string;
    description: string;
    imageUrl: string;
    sponsorName: string;
    ctaText: string;
    ctaUrl: string;
    city: string;
    adType: 'main' | 'local'; // main = universal, local = city-specific
    startDate: string; // When ad starts showing
    endDate: string; // When ad expires
    status: AdStatus;
  }>,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // TODO: Add admin check
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.imageUrl) updateData.image_url = updates.imageUrl;
    if (updates.sponsorName) updateData.sponsor_name = updates.sponsorName;
    if (updates.ctaText) updateData.cta_text = updates.ctaText;
    if (updates.ctaUrl) updateData.cta_url = updates.ctaUrl;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.adType) updateData.ad_type = updates.adType;
    if (updates.startDate) updateData.start_date = updates.startDate;
    if (updates.endDate) updateData.end_date = updates.endDate;
    if (updates.status) updateData.status = updates.status;
    
    const { error } = await supabase
      .from('ads')
      .update(updateData)
      .eq('id', adId);
    
    if (error) {
      console.error('Update ad error:', error);
      return { success: false, error: 'Failed to update ad' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error updating ad:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteAd(
  adId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // TODO: Add admin check
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', adId);
    
    if (error) {
      console.error('Delete ad error:', error);
      return { success: false, error: 'Failed to delete ad' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting ad:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function trackAdImpression(
  adId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Increment impressions counter
    const { error } = await supabase.rpc('increment_ad_impressions', {
      ad_id: adId,
    });
    
    if (error) {
      console.error('Track ad impression error:', error);
      return { success: false, error: 'Failed to track impression' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error tracking ad impression:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function trackAdClick(
  adId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Increment clicks counter
    const { error } = await supabase.rpc('increment_ad_clicks', {
      ad_id: adId,
    });
    
    if (error) {
      console.error('Track ad click error:', error);
      return { success: false, error: 'Failed to track click' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error tracking ad click:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// EVENT PROMOTIONS (Users pay to promote events)
// ============================================

export interface EventPromotion {
  id: string;
  eventId: string;
  userId: string;
  package: PromotionPackage;
  price: number;
  status: PromotionStatus;
  startDate?: string;
  endDate?: string;
  approvedById?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  event?: {
    id: string;
    title: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export async function createEventPromotion(
  promotionData: {
    eventId: string;
    package: PromotionPackage;
    price: number;
  },
  userId: string
): Promise<{ promotion: EventPromotion | null; error: string | null }> {
  try {
    console.log('📊 [createEventPromotion] Calling server endpoint...', {
      eventId: promotionData.eventId,
      userId,
      package: promotionData.package,
      price: promotionData.price,
    });

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/event-promotions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          eventId: promotionData.eventId,
          userId,
          package: promotionData.package,
          price: promotionData.price,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ [createEventPromotion] Server error:', errorData);
      return { promotion: null, error: errorData.error || 'Failed to create promotion request' };
    }

    const { promotion } = await response.json();
    console.log('✅ [createEventPromotion] Success!', promotion);
    return { promotion: promotion as EventPromotion, error: null };
  } catch (error) {
    console.error('❌ [createEventPromotion] Unexpected error:', error);
    return { promotion: null, error: 'An unexpected error occurred' };
  }
}

export async function getEventPromotions(
  filters?: {
    status?: PromotionStatus;
    userId?: string;
    eventId?: string;
  }
): Promise<{ promotions: EventPromotion[]; error: string | null }> {
  try {
    let query = supabase
      .from('event_promotions')
      .select(`
        *,
        event:events(id, title),
        user:users(id, name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    
    if (filters?.eventId) {
      query = query.eq('event_id', filters.eventId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Get promotions error:', error);
      return { promotions: [], error: 'Failed to load promotions' };
    }
    
    const promotions: EventPromotion[] = (data || []).map(p => ({
      id: p.id,
      eventId: p.event_id,
      userId: p.user_id,
      package: p.package,
      price: p.price,
      status: p.status,
      startDate: p.start_date,
      endDate: p.end_date,
      approvedById: p.approved_by_id,
      approvedAt: p.approved_at,
      rejectedReason: p.rejected_reason,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      event: p.event ? {
        id: p.event.id,
        title: p.event.title,
      } : undefined,
      user: p.user ? {
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
      } : undefined,
    }));
    
    return { promotions, error: null };
  } catch (error) {
    console.error('Unexpected error getting promotions:', error);
    return { promotions: [], error: 'An unexpected error occurred' };
  }
}

export async function approveEventPromotion(
  promotionId: string,
  adminId: string,
  durationDays: number = 7
): Promise<{ success: boolean; error: string | null }> {
  try {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    
    const { error } = await supabase
      .from('event_promotions')
      .update({
        status: 'approved',
        approved_by_id: adminId,
        approved_at: new Date().toISOString(),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })
      .eq('id', promotionId);
    
    if (error) {
      console.error('Approve promotion error:', error);
      return { success: false, error: 'Failed to approve promotion' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error approving promotion:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function rejectEventPromotion(
  promotionId: string,
  adminId: string,
  reason: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('event_promotions')
      .update({
        status: 'rejected',
        approved_by_id: adminId,
        rejected_reason: reason,
      })
      .eq('id', promotionId);
    
    if (error) {
      console.error('Reject promotion error:', error);
      return { success: false, error: 'Failed to reject promotion' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error rejecting promotion:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getActivePromotedEventIds(
  ethnicityId: string
): Promise<{ eventIds: string[]; error: string | null }> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('event_promotions')
      .select('event_id, events!inner(ethnicity_id)')
      .eq('status', 'approved')
      .eq('events.ethnicity_id', ethnicityId)
      .lte('start_date', now)
      .gte('end_date', now);
    
    if (error) {
      console.error('Get active promoted events error:', error);
      return { eventIds: [], error: 'Failed to load promoted events' };
    }
    
    const eventIds = data.map(p => p.event_id);
    return { eventIds, error: null };
  } catch (error) {
    console.error('Unexpected error getting promoted events:', error);
    return { eventIds: [], error: 'An unexpected error occurred' };
  }
}

// ============================================
// ANALYTICS & STATS
// ============================================

export async function getAdminAnalytics(
  ethnicityId?: string
): Promise<{
  analytics: {
    totalUsers: number;
    totalEvents: number;
    totalPlaces: number;
    totalAds: number;
    totalPromotions: number;
    pendingPromotions: number;
    pendingPlaces: number;
    revenueThisMonth: number;
  } | null;
  error: string | null;
}> {
  try {
    // Get total users
    let usersQuery = supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (ethnicityId) {
      usersQuery = usersQuery.eq('ethnicity_id', ethnicityId);
    }
    
    const { count: totalUsers } = await usersQuery;
    
    // Get total events
    let eventsQuery = supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    if (ethnicityId) {
      eventsQuery = eventsQuery.eq('ethnicity_id', ethnicityId);
    }
    
    const { count: totalEvents } = await eventsQuery;
    
    // Get total places
    let placesQuery = supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    
    if (ethnicityId) {
      placesQuery = placesQuery.eq('ethnicity_id', ethnicityId);
    }
    
    const { count: totalPlaces } = await placesQuery;
    
    // Get total ads
    let adsQuery = supabase
      .from('ads')
      .select('*', { count: 'exact', head: true });
    
    if (ethnicityId) {
      adsQuery = adsQuery.eq('ethnicity_id', ethnicityId);
    }
    
    const { count: totalAds } = await adsQuery;
    
    // Get total promotions
    const { count: totalPromotions } = await supabase
      .from('event_promotions')
      .select('*', { count: 'exact', head: true });
    
    // Get pending promotions
    const { count: pendingPromotions } = await supabase
      .from('event_promotions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    // Get pending places
    let pendingPlacesQuery = supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (ethnicityId) {
      pendingPlacesQuery = pendingPlacesQuery.eq('ethnicity_id', ethnicityId);
    }
    
    const { count: pendingPlaces } = await pendingPlacesQuery;
    
    // Calculate revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data: promotionsThisMonth } = await supabase
      .from('event_promotions')
      .select('price')
      .eq('status', 'approved')
      .gte('created_at', startOfMonth.toISOString());
    
    const revenueThisMonth = promotionsThisMonth?.reduce((sum, p) => sum + p.price, 0) || 0;
    
    return {
      analytics: {
        totalUsers: totalUsers || 0,
        totalEvents: totalEvents || 0,
        totalPlaces: totalPlaces || 0,
        totalAds: totalAds || 0,
        totalPromotions: totalPromotions || 0,
        pendingPromotions: pendingPromotions || 0,
        pendingPlaces: pendingPlaces || 0,
        revenueThisMonth,
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error getting analytics:', error);
    return { analytics: null, error: 'An unexpected error occurred' };
  }
}

export async function getAdAnalytics(
  adId: string
): Promise<{
  analytics: {
    impressions: number;
    clicks: number;
    ctr: number;
  } | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('impressions, clicks')
      .eq('id', adId)
      .single();
    
    if (error) {
      console.error('Get ad analytics error:', error);
      return { analytics: null, error: 'Failed to load ad analytics' };
    }
    
    const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
    
    return {
      analytics: {
        impressions: data.impressions,
        clicks: data.clicks,
        ctr: parseFloat(ctr.toFixed(2)),
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error getting ad analytics:', error);
    return { analytics: null, error: 'An unexpected error occurred' };
  }
}

// Check if user is admin
export async function checkIsAdmin(
  userId: string
): Promise<{ isAdmin: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Check admin error:', error);
      return { isAdmin: false, error: 'Failed to check admin status' };
    }
    
    return { isAdmin: data.is_admin || false, error: null };
  } catch (error) {
    console.error('Unexpected error checking admin:', error);
    return { isAdmin: false, error: 'An unexpected error occurred' };
  }
}

// Set user as admin (only callable by existing admin)
export async function setUserAdmin(
  userId: string,
  isAdmin: boolean,
  adminId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // TODO: Verify adminId is actually an admin
    
    const { error } = await supabase
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId);
    
    if (error) {
      console.error('Set admin error:', error);
      return { success: false, error: 'Failed to set admin status' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error setting admin:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}