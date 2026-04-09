import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import type { User } from "firebase/auth";
import { useFirebase } from "./useFirebase";
import { doc, getDoc, setDoc, query, collection, where, getDocs } from "firebase/firestore";

export const useAuth = () => {
  const { auth, db } = useFirebase();
  const user = useState<User | null>("user", () => null);
  const loading = useState<boolean>("auth_loading", () => true);
  const username = useState<string | null>("username", () => null);

  const WHITELISTED_GOOGLE_EMAIL = "alvinraditya101@gmail.com";

  // Sync state with Firebase / Server session
  if (process.client) {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        // GLOBAL Whitelist Check
        if (u.email !== WHITELISTED_GOOGLE_EMAIL) {
          console.error(`[Auth] Unauthorized access attempt by ${u.email}. Forced logout.`);
          await signOut(auth);
          user.value = null;
          loading.value = false;
          return;
        }

        // Fetch linked username
        const q = query(collection(db, "usernames"), where("uid", "==", u.uid));
        const snapshot = await getDocs(q).catch(() => null); // Handle possible block
        if (snapshot && !snapshot.empty) {
          username.value = snapshot.docs[0].id;
        }
        user.value = u;
      }
      loading.value = false;
    });
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Whitelist Check
    if (result.user.email !== WHITELISTED_GOOGLE_EMAIL) {
      await signOut(auth);
      throw new Error(`Access Denied. Only Whitelisted Google Account is allowed to access this vault.`);
    }

    // SYNC SESSION WITH SERVER TO SET COOKIES
    const idToken = await result.user.getIdToken();
    await $fetch('/api/auth/session', {
      method: 'POST',
      body: { 
        idToken, 
        uid: result.user.uid, 
        email: result.user.email 
      }
    });

    return result;
  };

  const loginWithUsername = async (identifier: string, pass: string) => {
    // USE SERVER-SIDE PROXY TO BYPASS ADBLOCKERS
    const data: any = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { identifier, password: pass }
    })
    
    // Update state manually since onAuthStateChanged might be blocked
    user.value = { uid: data.uid, email: data.email } as any
    username.value = data.username
    
    return data
  };

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    await signOut(auth);
    user.value = null;
    username.value = null;
    navigateTo("/login");
  };

  return {
    user,
    loading,
    username,
    loginWithGoogle,
    loginWithUsername,
    logout
  };
};
