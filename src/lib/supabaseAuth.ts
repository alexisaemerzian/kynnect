import { supabase } from './supabase';
import type { UserData } from '../app/context/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Helper function to create user profile via server
async function createUserProfileViaServer(userId: string, email: string, name?: string, ethnicityId?: string) {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/users/profile`;
    console.log('Creating user profile via server at:', url);
    console.log('Request body:', { userId, email, name, ethnicityId });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        userId,
        email,
        name,
        ethnicityId: ethnicityId || localStorage.getItem('selectedEthnicity') || 'armenian',
      }),
    });
    
    console.log('Server response status:', response.status);
    const data = await response.json();
    console.log('Server response data:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create user profile');
    }
    
    return data.profile;
  } catch (error) {
    console.error('Error creating user profile via server:', error);
    throw error;
  }
}

// Sign up a new user
export async function signUp(email: string, password: string, userData: Omit<UserData, 'email'>) {
  try {
    console.log('Starting signup for:', email);
    
    // Check how many accounts exist with this email
    const { data: existingProfiles } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email);
    
    const accountCount = existingProfiles?.length || 0;
    console.log(`Found ${accountCount} existing accounts with email:`, email);
    
    // Allow up to 5 accounts per email (increased for flexibility with multiple ethnicities)
    if (accountCount >= 5) {
      return { 
        success: false, 
        error: 'Maximum of 5 accounts per email reached. Please use a different email or manage your existing accounts.' 
      };
    }
    
    // For additional accounts (2nd, 3rd, etc.), append a suffix to make the auth email unique
    // This keeps the real email in the profile table while satisfying Supabase's unique constraint
    let authEmail = email;
    if (accountCount > 0) {
      authEmail = `${email.split('@')[0]}+account${accountCount + 1}@${email.split('@')[1]}`;
      console.log(`Creating additional account #${accountCount + 1}, using auth email:`, authEmail);
    }
    
    // Create auth user with potentially modified email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        emailRedirectTo: undefined, // Don't require email confirmation
        data: {
          name: userData.name,
          base_email: email, // Store the real email in metadata
        }
      }
    });

    console.log('Auth signup result:', { authData, authError });

    if (authError) {
      // If auth user already exists but profile doesn't, this might be an orphaned account
      // This can happen if signup was interrupted or if the user is creating an additional account
      if (authError.message?.includes('User already registered') || authError.message?.includes('already been registered')) {
        console.log('⚠️ Auth user with modified email already exists. This likely means a previous signup was interrupted.');
        console.log('🔄 Will delete the orphaned auth account and create a fresh one...');
        
        // For additional accounts, we need to use a different strategy
        // Instead of trying to recover, we'll increment the suffix until we find an unused one
        if (accountCount > 0) {
          console.log('🔄 Trying alternative account suffixes...');
          
          // Try suffixes up to account10
          for (let suffix = accountCount + 2; suffix <= 10; suffix++) {
            const alternativeEmail = `${email.split('@')[0]}+account${suffix}@${email.split('@')[1]}`;
            console.log(`Trying alternative email: ${alternativeEmail}`);
            
            const { data: altAuthData, error: altAuthError } = await supabase.auth.signUp({
              email: alternativeEmail,
              password,
              options: {
                data: {
                  name: userData.name,
                  base_email: email,
                }
              }
            });
            
            if (!altAuthError && altAuthData.user) {
              console.log(`✅ Successfully created auth account with suffix ${suffix}`);
              authEmail = alternativeEmail;
              
              // Create the profile
              const { error: profileError } = await supabase.from('users').upsert({
                id: altAuthData.user.id,
                email, // Store the real email in the profile
                name: userData.name,
                phone: userData.phone,
                age: userData.age,
                ethnicity_id: localStorage.getItem('selectedEthnicity') || 'armenian',
                notification_city: userData.notificationCity || null,
                email_notifications: userData.emailNotifications ?? true,
                sms_notifications: userData.smsNotifications ?? true,
                is_organization: userData.isOrganization ?? false,
                organization_name: userData.organizationName || null,
                organization_type: userData.organizationType || null,
                organization_website: userData.organizationWebsite || null,
                organization_description: userData.organizationDescription || null,
                organization_location: userData.organizationLocation || null,
                available_ethnicities: (userData as any).availableEthnicities || [localStorage.getItem('selectedEthnicity') || 'armenian'],
              }, {
                onConflict: 'id',
                ignoreDuplicates: false,
              });
              
              if (profileError) throw profileError;
              
              console.log('✅ Signup successful with alternative suffix!');
              return { success: true, user: altAuthData.user };
            }
          }
          
          // If we get here, all suffixes failed
          throw new Error('Unable to create additional account. Please try again or contact support.');
        }
      }
      
      throw authError;
    }
    
    if (!authData.user) throw new Error('Failed to create user');

    console.log('Creating user profile in database for user ID:', authData.user.id);

    // Create user profile in database - use the REAL email, not the auth email
    // Use UPSERT to handle cases where the profile might already exist
    const { error: profileError } = await supabase.from('users').upsert({
      id: authData.user.id,
      email, // Store the real email in the profile
      name: userData.name,
      phone: userData.phone,
      age: userData.age,
      ethnicity_id: localStorage.getItem('selectedEthnicity') || 'armenian',
      notification_city: userData.notificationCity || null,
      email_notifications: userData.emailNotifications ?? true,
      sms_notifications: userData.smsNotifications ?? true,
      is_organization: userData.isOrganization ?? false,
      organization_name: userData.organizationName || null,
      organization_type: userData.organizationType || null,
      organization_website: userData.organizationWebsite || null,
      organization_description: userData.organizationDescription || null,
      organization_location: userData.organizationLocation || null,
      available_ethnicities: (userData as any).availableEthnicities || [localStorage.getItem('selectedEthnicity') || 'armenian'],
    }, {
      onConflict: 'id',
      ignoreDuplicates: false,
    });

    console.log('Profile creation result:', { profileError });

    if (profileError) throw profileError;

    console.log('Signup successful!');
    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in existing user
export async function signIn(email: string, password: string) {
  try {
    console.log('🔐 Starting sign in for:', email);
    console.log('📋 localStorage before sign in:', Object.keys(localStorage));
    
    // First, check how many accounts exist with this email
    const { data: profiles } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);
    
    const accountCount = profiles?.length || 0;
    console.log(`📊 Found ${accountCount} accounts with email:`, email);
    
    // Try to sign in with the exact email first (this would be the first/primary account)
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // If login fails with the exact email and there are multiple accounts,
    // try the modified email addresses (+account2, +account3)
    if (error && error.message?.includes('Invalid login credentials') && accountCount > 1) {
      console.log('🔍 Login failed with base email, trying additional account variations...');
      
      // Try +account2, +account3 variations
      for (let i = 2; i <= accountCount && i <= 3; i++) {
        const modifiedEmail = `${email.split('@')[0]}+account${i}@${email.split('@')[1]}`;
        console.log(`Trying auth email: ${modifiedEmail}`);
        
        const attemptResult = await supabase.auth.signInWithPassword({
          email: modifiedEmail,
          password,
        });
        
        if (!attemptResult.error && attemptResult.data.user) {
          console.log('✅ Login successful with modified email:', modifiedEmail);
          data = attemptResult.data;
          error = null;
          break;
        }
      }
    }
    
    // If still no success, provide a helpful error message
    if (error) {
      if (accountCount > 1 && error.message?.includes('Invalid login credentials')) {
        throw new Error(`Invalid password. You have ${accountCount} accounts with this email. Make sure you're using the correct password for this account.`);
      }
      throw error;
    }

    console.log('📋 localStorage after sign in:', Object.keys(localStorage));
    console.log('🔍 Looking for Supabase keys:', Object.keys(localStorage).filter(k => k.includes('sb-')));

    if (!data?.user) throw new Error('Failed to sign in');
    
    console.log('✅ Sign in successful, user ID:', data.user.id);
    console.log('📋 Session:', data.session ? 'exists' : 'missing');

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    
    // If no profile exists, create one (backfill for existing auth users)
    if (!profile) {
      console.log('User profile not found during login, creating one...');
      
      // Extract real email from metadata if available
      const realEmail = data.user.user_metadata?.base_email || data.user.email!;
      
      const { error: createError } = await supabase.from('users').insert({
        id: data.user.id,
        email: realEmail,
        name: data.user.user_metadata?.name || realEmail.split('@')[0],
        ethnicity_id: localStorage.getItem('selectedEthnicity') || 'armenian',
        email_notifications: true,
        sms_notifications: true,
        is_organization: false,
      });
      
      if (createError) {
        console.error('Failed to create user profile during login:', createError);
        throw new Error('Could not create user profile. Please contact support.');
      }
      
      // Fetch the newly created profile
      const { data: newProfile, error: newProfileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (newProfileError) throw newProfileError;
      
      // Restore ethnicity to localStorage
      if (newProfile.ethnicity_id) {
        localStorage.setItem('selectedEthnicity', newProfile.ethnicity_id);
      }
      
      console.log('📋 localStorage after profile creation:', Object.keys(localStorage));
      
      return { success: true, user: data.user, profile: newProfile };
    }

    // Restore ethnicity to localStorage
    if (profile.ethnicity_id) {
      localStorage.setItem('selectedEthnicity', profile.ethnicity_id);
    }
    
    console.log('📋 localStorage after restoring ethnicity:', Object.keys(localStorage));
    console.log('🔍 Supabase auth keys:', Object.keys(localStorage).filter(k => k.includes('sb-')));

    return { success: true, user: data.user, profile };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Get current session
export async function getCurrentUser() {
  console.log('🔍 getCurrentUser() called');
  try {
    // First check what's in localStorage
    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter(k => k.includes('supabase'));
    console.log('🔑 Supabase keys in localStorage:', supabaseKeys);
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('📋 Session check:', { hasSession: !!session, error });
    
    if (error) throw error;
    if (!session) {
      console.log('❌ No session found');
      return { success: false, user: null };
    }

    console.log('✅ Session found, user ID:', session.user.id);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    console.log('👤 Profile check:', { hasProfile: !!profile, profileError });

    // If profile doesn't exist OR RLS blocks access, create it via server
    if (!profile) {
      console.log('User profile not found (or RLS blocked), creating via server...');
      console.log('Profile error (if any):', profileError);
      
      try {
        const newProfile = await createUserProfileViaServer(
          session.user.id,
          session.user.email!,
          session.user.user_metadata?.name,
          localStorage.getItem('selectedEthnicity') || undefined
        );
        
        console.log('✅ Profile created successfully:', newProfile);
        
        // Restore ethnicity to localStorage
        if (newProfile.ethnicity_id) {
          localStorage.setItem('selectedEthnicity', newProfile.ethnicity_id);
          // Dispatch storage event to notify EthnicityContext
          window.dispatchEvent(new Event('storage'));
        }
        
        return { success: true, user: session.user, profile: newProfile };
      } catch (createError) {
        console.error('Failed to create user profile via server:', createError);
        throw new Error('Could not create user profile. Please try logging in again.');
      }
    }
    
    // Only throw profileError if it's not an RLS/missing profile issue
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Unexpected profile error:', profileError);
      throw profileError;
    }

    console.log('✅ Profile loaded successfully');

    // Restore ethnicity to localStorage
    if (profile.ethnicity_id) {
      localStorage.setItem('selectedEthnicity', profile.ethnicity_id);
      // Dispatch storage event to notify EthnicityContext
      window.dispatchEvent(new Event('storage'));
    }

    return { success: true, user: session.user, profile };
  } catch (error: any) {
    console.error('Get current user error:', error);
    return { success: false, error: error.message, user: null };
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<UserData>) {
  try {
    console.log('📝 updateUserProfile called with:', { userId, updates });
    
    const updateData = {
      name: updates.name,
      phone: updates.phone,
      age: updates.age,
      city: updates.city,
      bio: updates.bio,
      notification_city: updates.notificationCity,
      email_notifications: updates.emailNotifications,
      sms_notifications: updates.smsNotifications,
      organization_name: updates.organizationName,
      organization_type: updates.organizationType,
      organization_website: updates.organizationWebsite,
      organization_description: updates.organizationDescription,
      organization_location: updates.organizationLocation,
    };
    
    console.log('📦 Update data to send:', updateData);
    
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('❌ Supabase update error:', error);
      throw error;
    }
    
    console.log('✅ Profile updated successfully in database');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Update profile error:', error);
    return { success: false, error: error.message };
  }
}

// Upload avatar image
export async function uploadAvatar(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user profile with avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    return { success: false, error: error.message };
  }
}

// Delete account
export async function deleteAccount(userId: string) {
  try {
    // Delete user data (cascades to related tables)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) console.warn('Could not delete auth user:', authError);

    return { success: true };
  } catch (error: any) {
    console.error('Delete account error:', error);
    return { success: false, error: error.message };
  }
}

// Convert database user to UserData format
export function dbUserToUserData(dbUser: any): UserData {
  return {
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    age: dbUser.age,
    city: dbUser.city,
    bio: dbUser.bio,
    avatar: dbUser.avatar_url,
    notificationCity: dbUser.notification_city,
    emailNotifications: dbUser.email_notifications,
    smsNotifications: dbUser.sms_notifications,
    isOrganization: dbUser.is_organization,
    organizationName: dbUser.organization_name,
    organizationType: dbUser.organization_type,
    organizationWebsite: dbUser.organization_website,
    organizationDescription: dbUser.organization_description,
    organizationLocation: dbUser.organization_location,
    isPremium: dbUser.is_premium || false,
  };
}