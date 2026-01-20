import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { IUser, ICard } from "../types";
import { INITIAL_DECK } from "../constants";

export const createUserProfile = async (user: IUser) => {
    const userRef = doc(db, "users", user.id);
    await setDoc(userRef, {
        ...user,
        // Convert Date objects to ISO strings or Timestamps if needed, 
        // but Firestore handles dates okay-ish, user.deck might be large but okay for now.
        deck: user.deck,
        lastPlayedDate: user.lastPlayedDate || null
    });
};

export const getUserProfile = async (userId: string): Promise<IUser | null> => {
    try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                id: docSnap.id,
                lastPlayedDate: data.lastPlayedDate ? data.lastPlayedDate.toDate() : null,
            } as IUser;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
};

export const subscribeToUserProfile = (userId: string, onUpdate: (user: IUser | null) => void) => {
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const user = {
                ...data,
                id: docSnap.id,
                lastPlayedDate: data.lastPlayedDate ? data.lastPlayedDate.toDate() : null,
            } as IUser;
            onUpdate(user);
        } else {
            onUpdate(null);
        }
    }, (error) => {
        console.error("Error subscribing to profile:", error);
        // Don't call onUpdate(null) here necessarily, maybe keep stale data or handle error elsewhere
    });
};

export const updateUserProfile = async (userId: string, data: Partial<IUser>) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
};

export const linkPartner = async (userId: string, partnerCode: string) => {
    // Logic to find partner by code and link them
    // For now simplistic implementation
    // In a real app we'd query users where coupleCode == partnerCode
};
