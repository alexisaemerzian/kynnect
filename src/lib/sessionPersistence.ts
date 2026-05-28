// IndexedDB-based session persistence for Figma Make sandbox
const DB_NAME = 'KynnectDB';
const STORE_NAME = 'auth';
const SESSION_KEY = 'session';

let db: IDBDatabase | null = null;

// Initialize IndexedDB
async function initDB(): Promise<IDBDatabase> {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      console.log('✅ IndexedDB initialized');
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
        console.log('📦 IndexedDB store created');
      }
    };
  });
}

// Save session to IndexedDB
export async function saveSession(session: any): Promise<void> {
  try {
    const database = await initDB();
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    store.put(session, SESSION_KEY);
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        console.log('💾 Session saved to IndexedDB');
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('❌ Failed to save session to IndexedDB:', error);
  }
}

// Load session from IndexedDB
export async function loadSession(): Promise<any | null> {
  try {
    const database = await initDB();
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(SESSION_KEY);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const session = request.result;
        if (session) {
          console.log('✅ Session loaded from IndexedDB');
          resolve(session);
        } else {
          console.log('⚠️ No session in IndexedDB');
          resolve(null);
        }
      };
      request.onerror = () => {
        console.error('❌ Failed to load session from IndexedDB');
        resolve(null);
      };
    });
  } catch (error) {
    console.error('❌ Error loading session from IndexedDB:', error);
    return null;
  }
}

// Clear session from IndexedDB
export async function clearSession(): Promise<void> {
  try {
    const database = await initDB();
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    store.delete(SESSION_KEY);
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        console.log('🗑️ Session cleared from IndexedDB');
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('❌ Failed to clear session from IndexedDB:', error);
  }
}
