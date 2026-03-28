import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

/**
 * SecureStore tem limite de ~2 KB por valor.
 * Tokens JWT do Supabase podem passar disso, então armazenamos em chunks.
 *
 * Segurança extra:
 * - WHEN_UNLOCKED_THIS_DEVICE_ONLY: só acessível com o dispositivo desbloqueado
 *   e NÃO incluído em backups do iCloud/iTunes.
 * - No Android o valor é criptografado com AES-256 no Keystore do sistema.
 */
const CHUNK_SIZE = 1800;
const STORE_OPTS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const numChunksStr = await SecureStore.getItemAsync(`${key}_numchunks`, STORE_OPTS);
      if (!numChunksStr) {
        return await SecureStore.getItemAsync(key, STORE_OPTS);
      }
      const numChunks = parseInt(numChunksStr, 10);
      const chunks: string[] = [];
      for (let i = 0; i < numChunks; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`, STORE_OPTS);
        if (chunk) chunks.push(chunk);
      }
      return chunks.join('');
    } catch {
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value, STORE_OPTS);
      await SecureStore.deleteItemAsync(`${key}_numchunks`, STORE_OPTS);
      return;
    }
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i], STORE_OPTS);
    }
    await SecureStore.setItemAsync(`${key}_numchunks`, String(chunks.length), STORE_OPTS);
  },

  removeItem: async (key: string): Promise<void> => {
    const numChunksStr = await SecureStore.getItemAsync(`${key}_numchunks`, STORE_OPTS);
    if (numChunksStr) {
      const numChunks = parseInt(numChunksStr, 10);
      for (let i = 0; i < numChunks; i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`, STORE_OPTS);
      }
      await SecureStore.deleteItemAsync(`${key}_numchunks`, STORE_OPTS);
    }
    await SecureStore.deleteItemAsync(key, STORE_OPTS);
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
