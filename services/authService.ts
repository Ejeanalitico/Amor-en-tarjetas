import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { auth } from "./firebase";

export const registerUser = async (email: string, pass: string) => {
    return await createUserWithEmailAndPassword(auth, email, pass);
};

export const loginUser = async (email: string, pass: string) => {
    return await signInWithEmailAndPassword(auth, email, pass);
};

export const logoutUser = async () => {
    return await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
