import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// De config die je via VITE_FIREBASE_CONFIG binnenkrijgt
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
