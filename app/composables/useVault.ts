import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  getDoc,
  Timestamp,
  orderBy
} from "firebase/firestore";
import { useFirebase } from "./useFirebase";
import { useAuth } from "./useAuth";
import { encryptContent, decryptContent } from "~/utils/encryption";

export interface VaultItem {
  id?: string;
  userId: string;
  title: string;
  type: 'plain_text' | 'code' | 'password' | 'account' | 'email';
  content: string;
  language?: string;
  is_public: boolean;
  createdAt?: any;
}

export const useVault = () => {
  const { db } = useFirebase();
  const { user } = useAuth();
  const items = ref<VaultItem[]>([]);
  const loading = ref(true);

  // Helper to determine if a type should be encrypted
  const isSecretType = (type: string) => ['password', 'account', 'email'].includes(type);

  const refresh = async () => {
    if (!user.value) return;
    loading.value = true;
    try {
      const data: any = await $fetch('/api/vault/list');
      items.value = data;
    } catch (e) {
      console.error('[Vault] Refresh failed:', e);
    } finally {
      loading.value = false;
    }
  };

  if (process.client) {
    watch(user, (u) => {
      if (u) {
        refresh();
      } else {
        items.value = [];
        loading.value = false;
      }
    }, { immediate: true });
  }

  const addItem = async (item: Omit<VaultItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!user.value) return;
    
    let finalContent = item.content;
    if (isSecretType(item.type)) {
      finalContent = encryptContent(item.content, user.value.uid);
    }

    const result: any = await $fetch('/api/vault/save', {
      method: 'POST',
      body: { 
        ...item, 
        content: finalContent 
      }
    });
    
    await refresh();
    return result;
  };

  const updateItem = async (id: string, item: Partial<VaultItem>) => {
    if (!user.value) return;
    
    let finalContent = item.content;
    if (item.type && isSecretType(item.type) && item.content) { 
      finalContent = encryptContent(item.content, user.value.uid);
    }

    const result: any = await $fetch('/api/vault/save', {
      method: 'POST',
      body: { 
        id, 
        ...item, 
        ...(finalContent ? { content: finalContent } : {})
      }
    });

    await refresh();
    return result;
  };

  const deleteItem = async (id: string) => {
    const result: any = await $fetch('/api/vault/delete', {
      method: 'POST',
      body: { id }
    });
    
    await refresh();
    return result;
  };

  const getItem = async (id: string) => {
    // 1. Try to find in local items list first
    const cached = items.value.find(i => i.id === id);
    if (cached) return cached;
    
    // 2. Fetch from server if not found in cache (e.g. on page refresh)
    try {
      const data: any = await $fetch('/api/vault/item', {
        params: { id }
      });
      return data;
    } catch (e) {
      console.error('[Vault] Failed to fetch item details from server:', e);
      return null;
    }
  };

  const getDecryptedPassword = (ciphertext: string) => {
    if (!user.value) return "";
    return decryptContent(ciphertext, user.value.uid);
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    getDecryptedPassword,
    refresh
  };
};
