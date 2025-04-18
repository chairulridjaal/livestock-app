// firebase.example.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID_HERE",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
