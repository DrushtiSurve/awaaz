import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBzx5ApuMYXGO0X8RHD-RgqCr_NWzmmPOI",
  authDomain: "awaaz-7a12e.firebaseapp.com",
  projectId: "awaaz-7a12e",
  storageBucket: "awaaz-7a12e.firebasestorage.app",
  messagingSenderId: "517327611932",
  appId: "1:517327611932:web:b76055e6234e5d239617d9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);