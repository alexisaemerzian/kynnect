// Quick Resume - Store minimal credentials on server for instant re-login
// This is a workaround for Figma Make's aggressive storage clearing

import { projectId, publicAnonKey } from '../../utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-026f502c`;

// Store encrypted credentials on server for quick resume
export async function saveQuickResume(email: string, userId: string) {
  try {
    // Generate a device ID (pseudo-persistent)
    const deviceId = getOrCreateDeviceId();
    
    const response = await fetch(`${SERVER_URL}/auth/quick-resume/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        deviceId,
        email,
        userId,
      }),
    });

    if (response.ok) {
      const { resumeToken } = await response.json();
      console.log('✅ Quick resume saved, token:', resumeToken);
      return resumeToken;
    }
  } catch (error) {
    console.error('❌ Failed to save quick resume:', error);
  }
  return null;
}

// Load quick resume data
export async function loadQuickResume(resumeToken: string) {
  try {
    const response = await fetch(`${SERVER_URL}/auth/quick-resume/load/${resumeToken}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Quick resume loaded');
      return data;
    }
  } catch (error) {
    console.error('❌ Failed to load quick resume:', error);
  }
  return null;
}

// Generate or retrieve a semi-persistent device ID
// We'll use multiple techniques to try to persist it
function getOrCreateDeviceId(): string {
  // Try to get from URL first
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const urlDeviceId = urlParams.get('did');
  if (urlDeviceId) {
    return urlDeviceId;
  }

  // Try multiple storage locations
  const storageKey = 'kynnect_device_id';
  
  // Try localStorage
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored;
  } catch {}

  // Try sessionStorage
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) return stored;
  } catch {}

  // Generate new device ID
  const deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // Store everywhere
  try { localStorage.setItem(storageKey, deviceId); } catch {}
  try { sessionStorage.setItem(storageKey, deviceId); } catch {}
  
  // Add to URL hash
  const hash = window.location.hash;
  const newHash = hash ? `${hash}&did=${deviceId}` : `#did=${deviceId}`;
  window.history.replaceState({}, '', window.location.pathname + window.location.search + newHash);
  
  return deviceId;
}

// Add resume token to URL for persistence
export function addResumeTokenToUrl(resumeToken: string) {
  const url = new URL(window.location.href);
  const hash = url.hash.substring(1);
  const params = new URLSearchParams(hash);
  params.set('rt', resumeToken);
  url.hash = params.toString();
  window.history.replaceState({}, '', url);
  console.log('🔗 Resume token added to URL');
}

// Get resume token from URL
export function getResumeTokenFromUrl(): string | null {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('rt');
}
