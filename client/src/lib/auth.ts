// Simple authentication replacement for Supabase
import { apiRequest } from './queryClient';

export interface User {
  id: string;
  email: string;
}

export interface Session {
  user: User;
  access_token: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'user' | 'mitra' | 'admin';
  is_verified: boolean;
  is_blocked: boolean;
}

class AuthClient {
  private currentUser: User | null = null;
  private currentSession: Session | null = null;

  async signUp(email: string, password: string, options?: { data?: any }) {
    try {
      // For demo purposes, create a simple user
      const userId = crypto.randomUUID();
      const user: User = { id: userId, email };
      
      // Create profile
      const profileData = {
        id: userId,
        full_name: options?.data?.full_name || '',
        role: options?.data?.role || 'user',
        is_verified: false,
        is_blocked: false
      };
      
      await apiRequest('/api/profile', {
        method: 'POST',
        body: JSON.stringify(profileData)
      });
      
      // Create user profile for balance tracking
      if (profileData.role === 'user') {
        await apiRequest('/api/user-profile', {
          method: 'POST',
          body: JSON.stringify({
            user_id: userId,
            balance: 0
          })
        });
      }
      
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signIn(email: string, password: string) {
    try {
      // For demo purposes, simulate login
      const userId = 'demo-user-' + Math.random().toString(36).substr(2, 9);
      const user: User = { id: userId, email };
      const session: Session = { user, access_token: 'demo-token' };
      
      this.currentUser = user;
      this.currentSession = session;
      
      return { data: { user, session }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signOut() {
    this.currentUser = null;
    this.currentSession = null;
    return { error: null };
  }

  async getUser() {
    return { data: { user: this.currentUser }, error: null };
  }

  async getSession() {
    return { data: { session: this.currentSession }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    // For demo purposes, simulate auth state changes
    setTimeout(() => {
      callback('SIGNED_IN', this.currentSession);
    }, 100);
    
    return {
      data: { subscription: { unsubscribe: () => {} } },
      error: null
    };
  }
}

export const auth = new AuthClient();

// Database operations
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const profile = await apiRequest(`/api/profile/${userId}`);
    return profile;
  } catch (error) {
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  try {
    const profile = await apiRequest(`/api/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return profile;
  } catch (error) {
    return null;
  }
}