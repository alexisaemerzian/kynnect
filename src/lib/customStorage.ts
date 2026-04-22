// Custom storage adapter for Supabase that writes to MULTIPLE storage mechanisms
// This is a workaround for Figma Make's aggressive storage clearing

class MultiStorageAdapter {
  private async getFromIndexedDB(key: string): Promise<string | null> {
    try {
      const db = await this.openDB();
      const tx = db.transaction('kv', 'readonly');
      const store = tx.objectStore('kv');
      const result = await new Promise<string | null>((resolve) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
      return result;
    } catch {
      return null;
    }
  }

  private async setToIndexedDB(key: string, value: string): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction('kv', 'readwrite');
      const store = tx.objectStore('kv');
      store.put(value, key);
      await new Promise<void>((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // Ignore errors
    }
  }

  private async removeFromIndexedDB(key: string): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction('kv', 'readwrite');
      const store = tx.objectStore('kv');
      store.delete(key);
    } catch {
      // Ignore errors
    }
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SupabaseStorage', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('kv')) {
          db.createObjectStore('kv');
        }
      };
    });
  }

  // Supabase Storage interface methods
  async getItem(key: string): Promise<string | null> {
    console.log(`🔍 Getting key: ${key}`);
    
    // Try localStorage first (fastest)
    try {
      const localValue = localStorage.getItem(key);
      if (localValue) {
        console.log(`✅ Found in localStorage: ${key}`);
        return localValue;
      }
    } catch {}

    // Try sessionStorage
    try {
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) {
        console.log(`✅ Found in sessionStorage: ${key}`);
        // Restore to localStorage
        try { localStorage.setItem(key, sessionValue); } catch {}
        return sessionValue;
      }
    } catch {}

    // Try cookies
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === `sb_${key}`) {
          const decoded = decodeURIComponent(value);
          console.log(`✅ Found in cookie: ${key}`);
          // Restore to localStorage
          try { localStorage.setItem(key, decoded); } catch {}
          return decoded;
        }
      }
    } catch {}

    // Try IndexedDB
    const idbValue = await this.getFromIndexedDB(key);
    if (idbValue) {
      console.log(`✅ Found in IndexedDB: ${key}`);
      // Restore to localStorage
      try { localStorage.setItem(key, idbValue); } catch {}
      return idbValue;
    }

    console.log(`❌ Not found anywhere: ${key}`);
    return null;
  }

  async setItem(key: string, value: string): Promise<void> {
    console.log(`💾 Saving key: ${key}`);
    
    // Clean the value to ensure it's serializable
    let cleanValue = value;
    try {
      // If it's a JSON string, parse and re-stringify to remove any non-serializable parts
      if (value.startsWith('{') || value.startsWith('[')) {
        const parsed = JSON.parse(value);
        // For session data, only keep serializable fields
        if (parsed && typeof parsed === 'object') {
          if (parsed.access_token) {
            // This is session data - clean it
            const cleanSession = {
              access_token: parsed.access_token,
              refresh_token: parsed.refresh_token,
              expires_at: parsed.expires_at,
              expires_in: parsed.expires_in,
              token_type: parsed.token_type,
              user: parsed.user ? {
                id: parsed.user.id,
                email: parsed.user.email,
                user_metadata: parsed.user.user_metadata,
              } : undefined,
            };
            cleanValue = JSON.stringify(cleanSession);
          } else {
            // Re-stringify to ensure it's clean
            cleanValue = JSON.stringify(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('Could not clean value, using as-is:', e);
    }
    
    // Write to ALL storage mechanisms simultaneously
    // localStorage
    try {
      localStorage.setItem(key, cleanValue);
    } catch (e) {
      console.warn('Failed to set localStorage:', e);
    }

    // sessionStorage
    try {
      sessionStorage.setItem(key, cleanValue);
    } catch (e) {
      console.warn('Failed to set sessionStorage:', e);
    }

    // Cookies (with 7 day expiry)
    try {
      const encoded = encodeURIComponent(cleanValue);
      document.cookie = `sb_${key}=${encoded}; max-age=${7 * 24 * 60 * 60}; path=/; SameSite=Lax`;
    } catch (e) {
      console.warn('Failed to set cookie:', e);
    }

    // IndexedDB (async)
    this.setToIndexedDB(key, cleanValue).catch(e => {
      console.warn('Failed to set IndexedDB:', e);
    });

    console.log(`✅ Saved to all storage mechanisms: ${key}`);
  }

  async removeItem(key: string): Promise<void> {
    console.log(`🗑️ Removing key: ${key}`);
    
    // Remove from ALL storage mechanisms
    try { localStorage.removeItem(key); } catch {}
    try { sessionStorage.removeItem(key); } catch {}
    try { document.cookie = `sb_${key}=; max-age=0; path=/`; } catch {}
    this.removeFromIndexedDB(key).catch(() => {});
  }
}

export const customStorageAdapter = new MultiStorageAdapter();