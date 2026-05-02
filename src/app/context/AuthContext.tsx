import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { signIn, signOut, getCurrentUser, updateUserProfile, dbUserToUserData } from '../../lib/supabaseAuth';
import { saveSession, loadSession, clearSession } from '../../lib/sessionPersistence';
import { saveSessionToCookie, loadSessionFromCookie, clearSessionCookie } from '../../lib/cookieSession';
import { saveQuickResume, loadQuickResume, getResumeTokenFromUrl, addResumeTokenToUrl } from '../../lib/quickResume';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  city?: string;
  bio?: string;
  avatar?: string;
  notificationCity?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  isOrganization?: boolean;
  organizationName?: string;
  organizationType?: string;
  organizationWebsite?: string;
  organizationDescription?: string;
  organizationLocation?: string;
  isPremium?: boolean;
}

interface AuthContextType {
  user: UserData | null;
  userId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateNotificationPreferences: (preferences: { notificationCity?: string; emailNotifications?: boolean; smsNotifications?: boolean }) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshPremiumStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const checkUser = async () => {
    console.log('⚙️ checkUser() called');
    try {
      const { success, user: authUser, profile } = await getCurrentUser();
      console.log('📊 checkUser result:', { success, hasAuthUser: !!authUser, hasProfile: !!profile });
      if (success && authUser && profile) {
        const userData = dbUserToUserData(profile);
        userData.id = authUser.id;
        setUser(userData);
        setUserId(authUser.id);
        setIsPremium(userData.isPremium || false);
      }
    } catch (error) {
      console.error('❌ Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreSessionFromServer = async (sessionToken: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/auth/get-session/${sessionToken}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        console.error('❌ Failed to retrieve session from server');
        setLoading(false);
        return;
      }

      const { session: sessionData } = await response.json();

      if (sessionData) {
        console.log('🔗 Restoring session from server...');
        const { error } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        });

        if (error) {
          console.error('❌ Failed to set session:', error);
          setLoading(false);
        } else {
          console.log('✅ Session restored from server successfully');
          await checkUser();
        }
      } else {
        console.log('❌ No session data from server');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error restoring session from server:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 AuthContext mounted, checking user...');
    
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.substring(1));
    const sessionToken = hashParams.get('st');
    
    if (sessionToken) {
      console.log('🔗 Found session token in URL hash, restoring from server...');
      restoreSessionFromServer(sessionToken);
      return;
    }
    
    let initialCheckDone = false;
    
    const fallbackTimer = setTimeout(async () => {
      if (!initialCheckDone) {
        console.log('⏰ No INITIAL_SESSION event received, checking backups...');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('✅ Manual session check found session');
          await checkUser();
        } else {
          console.log('⚠️ No session found, checking cookie backup...');
          let sessionData = loadSessionFromCookie();
          
          if (!sessionData) {
            console.log('⚠️ No cookie found, checking IndexedDB backup...');
            sessionData = await loadSession();
          }
          
          if (sessionData && sessionData.access_token && sessionData.refresh_token) {
            console.log('🔄 Found session backup, attempting to restore...');
            try {
              const { data, error } = await supabase.auth.setSession({
                access_token: sessionData.access_token,
                refresh_token: sessionData.refresh_token,
              });
              
              if (error) {
                console.error('❌ Failed to restore session:', error);
                setLoading(false);
              } else {
                console.log('✅ Session restored successfully');
                await checkUser();
              }
            } catch (error) {
              console.error('❌ Error restoring session:', error);
              setLoading(false);
            }
          } else {
            console.log('❌ No session backup found, user needs to log in');
            setLoading(false);
          }
        }
      }
    }, 1500);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, 'Session exists:', !!session);
      
      if (event === 'INITIAL_SESSION') {
        console.log('📍 Initial session detected');
        initialCheckDone = true;
        clearTimeout(fallbackTimer);
        if (session) {
          await saveSession(session);
          saveSessionToCookie(session);
          await checkUser();
        } else {
          console.log('❌ No initial session, setting loading to false');
          setLoading(false);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          await saveSession(session);
          saveSessionToCookie(session);
        }
        await checkUser();
      } else if (event === 'SIGNED_OUT') {
        await clearSession();
        clearSessionCookie();
        setUser(null);
        setUserId(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(fallbackTimer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) throw error;
      
      if (profile.ethnicity_id) {
        localStorage.setItem('selectedEthnicity', profile.ethnicity_id);
        window.dispatchEvent(new Event('storage'));
      }
      
      const userData = dbUserToUserData(profile);
      userData.id = uid;
      
      try {
        const avatarResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/avatar/${uid}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (avatarResponse.ok) {
          const { avatarUrl } = await avatarResponse.json();
          if (avatarUrl) {
            userData.avatar = avatarUrl;
          }
        }
      } catch (avatarError) {
        console.error('Error fetching avatar:', avatarError);
      }
      
      setUser(userData);
      setUserId(uid);
      setIsPremium(userData.isPremium || false);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn(email, password);
      
      if (result.success && result.profile) {
        const userData = dbUserToUserData(result.profile);
        userData.id = result.user!.id;
        setUser(userData);
        setUserId(result.user!.id);
        setIsPremium(userData.isPremium || false);
        setLoading(false);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/auth/store-session`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
                body: JSON.stringify({
                  userId: result.user!.id,
                  session: {
                    access_token: session.access_token,
                    refresh_token: session.refresh_token,
                    expires_at: session.expires_at,
                    expires_in: session.expires_in,
                    token_type: session.token_type,
                  },
                }),
              }
            );
            
            if (response.ok) {
              const { sessionToken } = await response.json();
              console.log('✅ Session stored on server, token:', sessionToken);
              
              const url = new URL(window.location.href);
              url.hash = `#st=${sessionToken}`;
              window.history.replaceState({}, '', url.toString());
              console.log('🔗 Session token added to URL hash');
            }
          } catch (error) {
            console.error('❌ Failed to store session on server:', error);
          }
        }
        
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setUserId(null);
    localStorage.removeItem('selectedEthnicity');
  };

  const updateNotificationPreferences = async (preferences: { 
    notificationCity?: string; 
    emailNotifications?: boolean; 
    smsNotifications?: boolean 
  }) => {
    if (user && userId) {
      const updatedUser = { ...user, ...preferences };
      setUser(updatedUser);
      await updateUserProfile(userId, updatedUser);
    }
  };

  const refreshUser = async () => {
    if (userId) {
      await loadUserProfile(userId);
    }
  };

  const refreshPremiumStatus = async () => {
    if (userId) {
      await loadUserProfile(userId);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userId,
      isAuthenticated: !!user, 
      loading,
      isPremium,
      login, 
      logout, 
      updateNotificationPreferences,
      refreshUser,
      refreshPremiumStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a safe default instead of throwing - useful during initialization/unmounting
    // Only log in development to reduce console noise
    if (import.meta.env.DEV) {
      console.debug('useAuth: AuthProvider not ready yet, returning safe defaults');
    }
    return {
      user: null,
      userId: null,
      isAuthenticated: false,
      loading: false,
      isPremium: false,
      login: async () => ({ success: false, error: 'Auth not available' }),
      logout: async () => {},
      updateNotificationPreferences: async () => {},
      refreshUser: async () => {},
      refreshPremiumStatus: async () => {},
    };
  }
  return context;
}
