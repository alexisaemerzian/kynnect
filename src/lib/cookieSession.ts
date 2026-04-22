// Cookie-based session persistence for Figma Make sandbox
// Cookies are more resilient than localStorage/IndexedDB in restrictive environments

const SESSION_COOKIE_NAME = 'kynnect_session';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Save session to cookie
export function saveSessionToCookie(session: any): void {
  try {
    const sessionString = JSON.stringify(session);
    // Encode to handle special characters
    const encodedSession = encodeURIComponent(sessionString);
    
    // Set cookie with max age
    document.cookie = `${SESSION_COOKIE_NAME}=${encodedSession}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
    
    console.log('🍪 Session saved to cookie');
  } catch (error) {
    console.error('❌ Failed to save session to cookie:', error);
  }
}

// Load session from cookie
export function loadSessionFromCookie(): any | null {
  try {
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      
      if (name === SESSION_COOKIE_NAME) {
        const decodedValue = decodeURIComponent(value);
        const session = JSON.parse(decodedValue);
        console.log('🍪 Session loaded from cookie');
        return session;
      }
    }
    
    console.log('⚠️ No session cookie found');
    return null;
  } catch (error) {
    console.error('❌ Failed to load session from cookie:', error);
    return null;
  }
}

// Clear session cookie
export function clearSessionCookie(): void {
  try {
    // Set cookie with max-age=0 to delete it
    document.cookie = `${SESSION_COOKIE_NAME}=; max-age=0; path=/`;
    console.log('🍪 Session cookie cleared');
  } catch (error) {
    console.error('❌ Failed to clear session cookie:', error);
  }
}
