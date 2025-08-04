import { auth } from '../services/firebase';

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

export const getUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};

export const getUserEmail = (): string | null => {
  return auth.currentUser?.email || null;
};

export const refreshToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    
    // Force token refresh
    const token = await user.getIdToken(true);
    return token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await auth.signOut();
    sessionStorage.removeItem('sessionId');
    localStorage.removeItem('mission-control-state');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};