import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update, remove, push } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Firebase config - người dùng sẽ nhập thông tin này qua Settings
// Hoặc hardcode nếu dự án cố định
const firebaseConfig = {
  apiKey: "AIzaSyDcGU_Cxq1i6D_ZiohyPD2XIUrG3Bo4XV4",
  authDomain: "rungchuongvang-be4fa.firebaseapp.com",
  databaseURL: "https://rungchuongvang-be4fa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rungchuongvang-be4fa",
  storageBucket: "rungchuongvang-be4fa.firebasestorage.app",
  messagingSenderId: "763617620227",
  appId: "1:763617620227:web:4ce201c3b0df6d0aed7936",
  measurementId: "G-04YYN0N5LQ"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Đăng nhập ẩn danh để có userId
let currentUserId: string | null = null;

const authReady = new Promise<string>((resolve) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserId = user.uid;
      resolve(user.uid);
    }
  });
  signInAnonymously(auth).catch((error) => {
    console.error('[Firebase] Auth error:', error);
    // Fallback: dùng random ID nếu auth fail
    currentUserId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    resolve(currentUserId);
  });
});

export function getCurrentUserId(): string {
  return currentUserId || `anon_${Date.now()}`;
}

export async function waitForAuth(): Promise<string> {
  return authReady;
}

export { database, auth, ref, set, get, onValue, update, remove, push };
