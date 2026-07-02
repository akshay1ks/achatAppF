import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { toIndianE164 } from '../lib/phone';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  sendOtp: (rawPhone: string) => Promise<void>;
  verifyOtp: (rawPhone: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const sendOtp = async (rawPhone: string) => {
    const phone = toIndianE164(rawPhone);
    if (!phone) throw new Error('Enter a valid Indian (+91) mobile number');
    // shouldCreateUser: true lets first-time users sign up via OTP.
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { channel: 'sms' },
    });
    if (error) throw error;
  };

  const verifyOtp = async (rawPhone: string, code: string) => {
    const phone = toIndianE164(rawPhone);
    if (!phone) throw new Error('Enter a valid Indian (+91) mobile number');
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    });
    if (error) throw error;
    // Make sure our backend has a users row for this person.
    try {
      await api.syncMe();
    } catch (e) {
      // non-fatal; backend also auto-provisions via DB trigger
      console.warn('syncMe failed', e);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, sendOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
