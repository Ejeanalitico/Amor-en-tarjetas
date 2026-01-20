import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBTBU8VhWHQ0A85dO2ozyHTChxdF65j08k",
  authDomain: "amor-en-tarjetas-app.firebaseapp.com",
  projectId: "amor-en-tarjetas-app",
  storageBucket: "amor-en-tarjetas-app.firebasestorage.app",
  messagingSenderId: "224767096740",
  appId: "1:224767096740:web:3a72a4400cc92563c5b331",
  version: "2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
export const storage = getStorage(app);
