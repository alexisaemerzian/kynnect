import { supabase } from './supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// ============================================
// PLACES MANAGEMENT
// ============================================

export type PlaceType = 'restaurant' | 'cafe' | 'church' | 'bakery' | 'shop' | 'other';
export type PlaceStatus = 'pending' | 'approved' | 'rejected';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  city: string;
  address: string;
  description: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  ethnicityId: string;
  submittedById: string;
  status: PlaceStatus;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  submittedBy?: {
    id: string;
    name: string;
  };
}

// ============================================
// PLACE FUNCTIONS
// ============================================

export async function submitPlace(
  placeData: {
    name: string;
    type: PlaceType;
    city: string;
    address: string;
    description: string;
    phone?: string;
    website?: string;
    imageUrl?: string;
    ethnicityId: string;
  },
  userId: string
): Promise<{ place: Place | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('places')
      .insert({
        name: placeData.name,
        type: placeData.type,
        city: placeData.city,
        address: placeData.address,
        description: placeData.description,
        phone: placeData.phone,
        website: placeData.website,
        image_url: placeData.imageUrl,
        ethnicity_id: placeData.ethnicityId,
        submitted_by_id: userId,
        status: 'pending', // All submissions start as pending
      })
      .select()
      .single();
    
    if (error) {
      console.error('Submit place error:', error);
      return { place: null, error: 'Failed to submit place' };
    }
    
    return { place: data as unknown as Place, error: null };
  } catch (error) {
    console.error('Unexpected error submitting place:', error);
    return { place: null, error: 'An unexpected error occurred' };
  }
}

export async function getPlaces(
  ethnicityId: string,
  filters?: {
    city?: string;
    type?: PlaceType;
    searchQuery?: string;
    status?: PlaceStatus;
  }
): Promise<{ places: Place[]; error: string | null }> {
  try {
    let query = supabase
      .from('places')
      .select(`
        *,
        submittedBy:users!submitted_by_id(id, name)
      `)
      .eq('ethnicity_id', ethnicityId)
      .eq('status', filters?.status || 'approved') // Default to approved places
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (filters?.city) {
      query = query.eq('city', filters.city);
    }
    
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters?.searchQuery) {
      // Search in name, city, or address
      query = query.or(
        `name.ilike.%${filters.searchQuery}%,city.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%`
      );
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Get places error:', error);
      return { places: [], error: 'Failed to load places' };
    }
    
    const places: Place[] = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      city: p.city,
      address: p.address,
      description: p.description,
      phone: p.phone,
      website: p.website,
      imageUrl: p.image_url,
      ethnicityId: p.ethnicity_id,
      submittedById: p.submitted_by_id,
      status: p.status,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      submittedBy: p.submittedBy ? {
        id: p.submittedBy.id,
        name: p.submittedBy.name,
      } : undefined,
    }));
    
    return { places, error: null };
  } catch (error) {
    console.error('Unexpected error getting places:', error);
    return { places: [], error: 'An unexpected error occurred' };
  }
}

export async function getPlaceById(
  placeId: string
): Promise<{ place: Place | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        submittedBy:users!submitted_by_id(id, name)
      `)
      .eq('id', placeId)
      .single();
    
    if (error) {
      console.error('Get place error:', error);
      return { place: null, error: 'Failed to load place' };
    }
    
    const place: Place = {
      id: data.id,
      name: data.name,
      type: data.type,
      city: data.city,
      address: data.address,
      description: data.description,
      phone: data.phone,
      website: data.website,
      imageUrl: data.image_url,
      ethnicityId: data.ethnicity_id,
      submittedById: data.submitted_by_id,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      submittedBy: data.submittedBy ? {
        id: data.submittedBy.id,
        name: data.submittedBy.name,
      } : undefined,
    };
    
    return { place, error: null };
  } catch (error) {
    console.error('Unexpected error getting place:', error);
    return { place: null, error: 'An unexpected error occurred' };
  }
}

export async function updatePlace(
  placeId: string,
  updates: Partial<{
    name: string;
    type: PlaceType;
    city: string;
    address: string;
    description: string;
    phone: string;
    website: string;
    imageUrl: string;
    status: PlaceStatus;
  }>,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Verify user is the submitter or admin
    const { data: placeData } = await supabase
      .from('places')
      .select('submitted_by_id')
      .eq('id', placeId)
      .single();
    
    if (!placeData) {
      return { success: false, error: 'Place not found' };
    }
    
    // For now, only the submitter can update (admin check would go here)
    if (placeData.submitted_by_id !== userId) {
      return { success: false, error: 'You can only update your own submissions' };
    }
    
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.type) updateData.type = updates.type;
    if (updates.city) updateData.city = updates.city;
    if (updates.address) updateData.address = updates.address;
    if (updates.description) updateData.description = updates.description;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.website !== undefined) updateData.website = updates.website;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.status) updateData.status = updates.status;
    
    const { error } = await supabase
      .from('places')
      .update(updateData)
      .eq('id', placeId);
    
    if (error) {
      console.error('Update place error:', error);
      return { success: false, error: 'Failed to update place' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error updating place:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deletePlace(
  placeId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Verify user is the submitter or admin
    const { data: placeData } = await supabase
      .from('places')
      .select('submitted_by_id')
      .eq('id', placeId)
      .single();
    
    if (!placeData) {
      return { success: false, error: 'Place not found' };
    }
    
    // For now, only the submitter can delete (admin check would go here)
    if (placeData.submitted_by_id !== userId) {
      return { success: false, error: 'You can only delete your own submissions' };
    }
    
    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', placeId);
    
    if (error) {
      console.error('Delete place error:', error);
      return { success: false, error: 'Failed to delete place' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting place:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getCitiesByEthnicity(
  ethnicityId: string
): Promise<{ cities: string[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('city')
      .eq('ethnicity_id', ethnicityId)
      .eq('status', 'approved');
    
    if (error) {
      console.error('Get cities error:', error);
      return { cities: [], error: 'Failed to load cities' };
    }
    
    // Get unique cities
    const cities = [...new Set(data.map(p => p.city))].sort();
    
    return { cities, error: null };
  } catch (error) {
    console.error('Unexpected error getting cities:', error);
    return { cities: [], error: 'An unexpected error occurred' };
  }
}

export async function getPlaceStats(
  ethnicityId: string
): Promise<{
  stats: {
    totalPlaces: number;
    byType: Record<PlaceType, number>;
    byCityCount: number;
  } | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('type, city')
      .eq('ethnicity_id', ethnicityId)
      .eq('status', 'approved');
    
    if (error) {
      console.error('Get stats error:', error);
      return { stats: null, error: 'Failed to load stats' };
    }
    
    const byType: Record<PlaceType, number> = {
      restaurant: 0,
      cafe: 0,
      church: 0,
      bakery: 0,
      shop: 0,
      other: 0,
    };
    
    const cities = new Set<string>();
    
    data.forEach(place => {
      byType[place.type as PlaceType]++;
      cities.add(place.city);
    });
    
    return {
      stats: {
        totalPlaces: data.length,
        byType,
        byCityCount: cities.size,
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error getting stats:', error);
    return { stats: null, error: 'An unexpected error occurred' };
  }
}

// Get places submitted by a specific user
export async function getUserPlaces(
  userId: string,
  status?: PlaceStatus
): Promise<{ places: Place[]; error: string | null }> {
  try {
    let query = supabase
      .from('places')
      .select(`
        *,
        submittedBy:users!submitted_by_id(id, name)
      `)
      .eq('submitted_by_id', userId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Get user places error:', error);
      return { places: [], error: 'Failed to load your places' };
    }
    
    const places: Place[] = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      city: p.city,
      address: p.address,
      description: p.description,
      phone: p.phone,
      website: p.website,
      imageUrl: p.image_url,
      ethnicityId: p.ethnicity_id,
      submittedById: p.submitted_by_id,
      status: p.status,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      submittedBy: p.submittedBy ? {
        id: p.submittedBy.id,
        name: p.submittedBy.name,
      } : undefined,
    }));
    
    return { places, error: null };
  } catch (error) {
    console.error('Unexpected error getting user places:', error);
    return { places: [], error: 'An unexpected error occurred' };
  }
}

// Admin function to approve/reject places
export async function moderatePlace(
  placeId: string,
  status: 'approved' | 'rejected',
  moderatorId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Use server endpoint to bypass RLS
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/places/${placeId}/moderate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ status }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Moderate place error:', errorData);
      return { success: false, error: errorData.error || 'Failed to moderate place' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error moderating place:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get pending places for moderation
export async function getPendingPlaces(
  ethnicityId?: string
): Promise<{ places: Place[]; error: string | null }> {
  try {
    // Use server endpoint to bypass RLS
    const url = new URL(
      `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/places/pending`
    );
    
    if (ethnicityId) {
      url.searchParams.append('ethnicityId', ethnicityId);
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Get pending places error:', errorData);
      return { places: [], error: errorData.error || 'Failed to load pending places' };
    }
    
    const data = await response.json();
    
    const places: Place[] = (data.places || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      city: p.city,
      address: p.address,
      description: p.description,
      phone: p.phone,
      website: p.website,
      imageUrl: p.image_url,
      ethnicityId: p.ethnicity_id,
      submittedById: p.submitted_by_id,
      status: p.status,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      submittedBy: p.submittedBy ? {
        id: p.submittedBy.id,
        name: p.submittedBy.name,
      } : undefined,
    }));
    
    return { places, error: null };
  } catch (error) {
    console.error('Unexpected error getting pending places:', error);
    return { places: [], error: 'An unexpected error occurred' };
  }
}