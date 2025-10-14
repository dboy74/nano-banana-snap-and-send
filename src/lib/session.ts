/**
 * Session Management for Kiosk App
 * Generates and manages anonymous session IDs for tracking usage without authentication
 */

const SESSION_KEY = 'ai_island_session_id';
const SESSION_CREATED_KEY = 'ai_island_session_created';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get or create a session ID
 * Sessions are stored in localStorage and auto-expire after 24 hours
 */
export const getSessionId = (): string => {
  const existingSessionId = localStorage.getItem(SESSION_KEY);
  const sessionCreated = localStorage.getItem(SESSION_CREATED_KEY);
  
  // Check if session exists and is still valid
  if (existingSessionId && sessionCreated) {
    const createdTime = parseInt(sessionCreated, 10);
    const now = Date.now();
    
    if (now - createdTime < SESSION_DURATION_MS) {
      // Session is still valid
      return existingSessionId;
    }
  }
  
  // Create new session
  const newSessionId = crypto.randomUUID();
  const now = Date.now().toString();
  
  localStorage.setItem(SESSION_KEY, newSessionId);
  localStorage.setItem(SESSION_CREATED_KEY, now);
  
  console.log('New session created:', newSessionId);
  
  return newSessionId;
};

/**
 * Clear the current session
 * Useful when resetting the app or logging out
 */
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_CREATED_KEY);
  console.log('Session cleared');
};

/**
 * Refresh session timestamp to keep it alive
 * Call this on user activity to prevent premature expiration
 */
export const refreshSession = (): void => {
  const existingSessionId = localStorage.getItem(SESSION_KEY);
  if (existingSessionId) {
    const now = Date.now().toString();
    localStorage.setItem(SESSION_CREATED_KEY, now);
  }
};
