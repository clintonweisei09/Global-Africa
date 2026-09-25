import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, recoveryPhone: string, country: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithLinkedIn: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  enable2FA: () => Promise<{ error: string | null }>;
  enableFingerprint: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (error) {
      console.error('Profile fetch error:', error);
      return;
    }
    if (!data) {
      // Auto-create profile on first login
      const { data: created, error: createErr } = await supabase
        .from('profiles')
        .insert({
          id: uid,
          email: (await supabase.auth.getUser()).data.user?.email ?? '',
          full_name: '',
          profile_completion: 10,
        })
        .select('*')
        .maybeSingle();
      if (created) setProfile(created as UserProfile);
      if (createErr) console.error('Profile create error:', createErr);
      return;
    }
    setProfile(data as UserProfile);
  };

  const trackLoginLocation = async (uid: string) => {
    const device = navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
    const browser = navigator.userAgent.includes('Chrome') ? 'Chrome'
      : navigator.userAgent.includes('Firefox') ? 'Firefox'
      : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other';

    let lat: number | null = null;
    let lng: number | null = null;
    let city: string | null = null;
    let countryName: string | null = null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, enableHighAccuracy: true });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;

      // Reverse geocode using free Nominatim API
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
        const data = await res.json();
        city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county || null;
        countryName = data?.address?.country || null;
      } catch { /* geocode optional */ }
    } catch { /* geolocation denied — still record device/timestamp */ }

    await supabase.from('profiles').update({
      login_lat: lat,
      login_lng: lng,
      login_city: city,
      login_country: countryName,
      login_device: `${device} - ${browser}`,
      last_login_at: new Date().toISOString(),
    }).eq('id', uid);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, recoveryPhone: string, country: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const { error: profileErr } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        recovery_phone: recoveryPhone,
        country,
        two_factor_enabled: false,
        fingerprint_enabled: false,
        profile_completion: 15,
      });
      if (profileErr) console.error('Profile insert error:', profileErr);
      trackLoginLocation(data.user.id);
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) trackLoginLocation(data.user.id);
    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signInWithLinkedIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('*')
      .maybeSingle();
    if (error) return { error: error.message };
    if (data) setProfile(data as UserProfile);
    return { error: null };
  };

  const enable2FA = async () => {
    return updateProfile({ two_factor_enabled: true });
  };

  const enableFingerprint = async () => {
    return updateProfile({ fingerprint_enabled: true });
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signUp, signIn, signInWithGoogle, signInWithLinkedIn, signOut, updateProfile, enable2FA, enableFingerprint, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
