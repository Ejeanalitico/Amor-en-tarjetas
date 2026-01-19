import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { IFeedItem, IStory } from "../types";

export const addToFeed = async (item: IFeedItem) => {
    await addDoc(collection(db, "feed"), {
        ...item,
        timestamp: Timestamp.fromDate(item.timestamp)
    });
};

export const getFeed = async (): Promise<IFeedItem[]> => {
    const q = query(collection(db, "feed"), orderBy("timestamp", "desc"), limit(50));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp.toDate()
        } as IFeedItem;
    });
};

export const addStory = async (story: IStory) => {
    await addDoc(collection(db, "stories"), {
        ...story,
        expiresAt: Timestamp.fromDate(story.expiresAt)
    });
};

export const getStories = async (): Promise<IStory[]> => {
    const now = Timestamp.now();
    // In a real app we would query where expiresAt > now
    // For now get recent ones
    const q = query(collection(db, "stories"), limit(20)); // Simplification
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            expiresAt: data.expiresAt.toDate()
        } as IStory;
    }).filter(s => s.expiresAt > new Date());
};
