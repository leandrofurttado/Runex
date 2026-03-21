import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// SecureStore has a ~2KB limit per value, so large tokens need chunked storage
const CHUNK_SIZE = 1800;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const numChunksStr = await SecureStore.getItemAsync(`${key}_numchunks`);
      if (!numChunksStr) {
        return await SecureStore.getItemAsync(key);
      }
      const numChunks = parseInt(numChunksStr, 10);
      const chunks: string[] = [];
      for (let i = 0; i < numChunks; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
        if (chunk) chunks.push(chunk);
      }
      return chunks.join('');
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      await SecureStore.deleteItemAsync(`${key}_numchunks`);
      return;
    }
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
    }
    await SecureStore.setItemAsync(`${key}_numchunks`, String(chunks.length));
  },
  removeItem: async (key: string): Promise<void> => {
    const numChunksStr = await SecureStore.getItemAsync(`${key}_numchunks`);
    if (numChunksStr) {
      const numChunks = parseInt(numChunksStr, 10);
      for (let i = 0; i < numChunks; i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}_numchunks`);
    }
    await SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
