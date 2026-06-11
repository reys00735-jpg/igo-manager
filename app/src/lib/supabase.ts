import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const env = process.env as Record<string, string | undefined>;
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const DEMO_SESSION_KEY = 'igo-demo-session';
const DEMO_PROFILE_KEY = 'igo-demo-profile';
const DEMO_INITIATIVES_KEY = 'igo-demo-initiatives';
const DEMO_PLANS_KEY = 'igo-demo-plans';

export const hasSupabaseConfig = () => Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: AsyncStorage as any,
      },
      global: {
        headers: {
          'X-Client-Info': 'igo-manager-mobile',
        },
      },
    })
  : null as any;

export const getStoredDemoSession = async () => {
  try {
    const value = await AsyncStorage.getItem(DEMO_SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const setDemoSession = async (user?: any) => {
  const session = { user: user || { id: 'demo-user', email: 'demo@igo.app' } };
  await AsyncStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  return session;
};

export const clearDemoSession = async () => {
  await AsyncStorage.removeItem(DEMO_SESSION_KEY);
};

export const getSupabaseSession = async () => {
  if (!hasSupabaseConfig()) {
    return getStoredDemoSession();
  }

  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const ensureSupabaseSession = async () => {
  const session = await getSupabaseSession();
  if (!session) {
    throw new Error('No active Supabase session');
  }
  return session;
};

export const getCurrentUserProfile = async (profileData?: Record<string, any>) => {
  if (!hasSupabaseConfig()) {
    const stored = await AsyncStorage.getItem(DEMO_PROFILE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    const demoProfile = {
      id: 'demo-user',
      nombre: 'Emprendedor demo',
      correo: 'demo@igo.app',
      ...profileData,
    };
    await AsyncStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(demoProfile));
    return demoProfile;
  }

  const session = await ensureSupabaseSession();
  const user = session.user;

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.warn('Profile lookup failed:', error.message);
    return null;
  }

  if (data) {
    return data;
  }

  const payload: Record<string, any> = {
    auth_user_id: user.id,
    correo: user.email || '',
    nombre: user.user_metadata?.full_name || user.user_metadata?.name || 'Emprendedor',
    ...profileData,
  };

  const { data: created, error: insertError } = await supabase
    .from('users')
    .insert(payload)
    .select('*')
    .single();

  if (insertError) {
    console.warn('Profile creation failed:', insertError.message);
    return null;
  }

  return created;
};

export const listUserInitiatives = async () => {
  if (!hasSupabaseConfig()) {
    const value = await AsyncStorage.getItem(DEMO_INITIATIVES_KEY);
    return value ? JSON.parse(value) : [];
  }

  const profile = await getCurrentUserProfile();
  if (!profile?.id) {
    return [];
  }

  const { data } = await supabase
    .from('iniciativas')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  return data || [];
};

export const createUserInitiative = async (payload: Record<string, any>) => {
  if (!hasSupabaseConfig()) {
    const items = await listUserInitiatives();
    const nextItem = {
      id: `demo-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...payload,
    };
    const updated = [nextItem, ...items];
    await AsyncStorage.setItem(DEMO_INITIATIVES_KEY, JSON.stringify(updated));
    return nextItem;
  }

  const profile = await getCurrentUserProfile();
  if (!profile?.id) {
    return null;
  }

  const { data, error } = await supabase
    .from('iniciativas')
    .insert({ ...payload, user_id: profile.id })
    .select()
    .single();

  if (error) {
    return null;
  }

  return data;
};

export const updateUserInitiative = async (id: string, payload: Record<string, any>) => {
  if (!hasSupabaseConfig()) {
    const items = await listUserInitiatives();
    const updated = items.map((item: any) => (item.id === id ? { ...item, ...payload } : item));
    await AsyncStorage.setItem(DEMO_INITIATIVES_KEY, JSON.stringify(updated));
    return updated.find((item: any) => item.id === id) || null;
  }

  const { data, error } = await supabase
    .from('iniciativas')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return null;
  }

  return data;
};

export const createUserActionPlan = async (payload: Record<string, any>) => {
  if (!hasSupabaseConfig()) {
    const items = await AsyncStorage.getItem(DEMO_PLANS_KEY);
    const existing = items ? JSON.parse(items) : [];
    const nextItem = { id: `plan-${Date.now()}`, created_at: new Date().toISOString(), ...payload };
    await AsyncStorage.setItem(DEMO_PLANS_KEY, JSON.stringify([nextItem, ...existing]));
    return nextItem;
  }

  const profile = await getCurrentUserProfile();
  if (!profile?.id) {
    return null;
  }

  const { data, error } = await supabase
    .from('planes_accion')
    .insert({ ...payload, user_id: profile.id })
    .select()
    .single();

  if (error) {
    return null;
  }

  return data;
};
