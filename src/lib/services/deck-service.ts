import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Deck } from "@/lib/types";

// 获取用户的所有卡组
export async function getUserDecks(userId: string): Promise<Deck[]> {
    const decksRef = collection(db, "users", userId, "decks");
    const q = query(decksRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        lastStudied: doc.data().lastStudied
            ? (doc.data().lastStudied as Timestamp).toDate()
            : undefined,
    })) as Deck[];
}

// 获取单个卡组
export async function getDeck(userId: string, deckId: string): Promise<Deck | null> {
    const deckRef = doc(db, "users", userId, "decks", deckId);
    const deckSnap = await getDoc(deckRef);

    if (!deckSnap.exists()) return null;

    const data = deckSnap.data();
    return {
        id: deckSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        lastStudied: data.lastStudied
            ? (data.lastStudied as Timestamp).toDate()
            : undefined,
    } as Deck;
}

// 创建卡组
export async function createDeck(
    userId: string,
    name: string,
    description: string
): Promise<string> {
    const decksRef = collection(db, "users", userId, "decks");
    const docRef = await addDoc(decksRef, {
        name,
        description,
        cardCount: 0,
        progress: 0,
        createdAt: serverTimestamp(),
        lastStudied: null,
    });
    return docRef.id;
}


// 更新卡组
export async function updateDeck(
    userId: string,
    deckId: string,
    updates: Partial<Pick<Deck, "name" | "description" | "cardsPerSession">>
): Promise<void> {
    const deckRef = doc(db, "users", userId, "decks", deckId);
    await updateDoc(deckRef, updates);
}

// 删除卡组
export async function deleteDeck(userId: string, deckId: string): Promise<void> {
    const deckRef = doc(db, "users", userId, "decks", deckId);
    await deleteDoc(deckRef);
}

// 更新卡组卡片数量
export async function updateDeckCardCount(
    userId: string,
    deckId: string,
    count: number
): Promise<void> {
    const deckRef = doc(db, "users", userId, "decks", deckId);
    await updateDoc(deckRef, { cardCount: count });
}

// 更新最后学习时间
export async function updateDeckLastStudied(
    userId: string,
    deckId: string
): Promise<void> {
    const deckRef = doc(db, "users", userId, "decks", deckId);
    await updateDoc(deckRef, { lastStudied: serverTimestamp() });
}

// 重置卡组进度（清零所有卡片的熟练度和难度）
export async function resetDeckProgress(
    userId: string,
    deckId: string
): Promise<void> {
    const batch = writeBatch(db);

    // 1. 重置卡组进度
    const deckRef = doc(db, "users", userId, "decks", deckId);
    batch.update(deckRef, {
        progress: 0,
        lastStudied: null
    });

    // 2. 重置所有卡片的熟练度和难度
    const cardsRef = collection(db, "users", userId, "decks", deckId, "cards");
    const cardsSnapshot = await getDocs(cardsRef);

    cardsSnapshot.forEach((cardDoc) => {
        batch.update(cardDoc.ref, {
            mastery: 0,
            difficulty: "medium",
            lastReviewed: null,
            nextReview: null
        });
    });

    await batch.commit();
}

// 获取待复习卡片数量（熟练度 < 100 的卡片）
export async function getDueCardsCount(
    userId: string,
    deckId: string
): Promise<number> {
    const cardsRef = collection(db, "users", userId, "decks", deckId, "cards");
    const snapshot = await getDocs(cardsRef);

    let dueCount = 0;
    snapshot.forEach((doc) => {
        const data = doc.data();
        const mastery = data.mastery || 0;
        if (mastery < 100) {
            dueCount++;
        }
    });

    return dueCount;
}
