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
import type { Flashcard } from "@/lib/types";
import { updateDeckCardCount } from "./deck-service";

// 获取卡组内所有卡片
export async function getDeckCards(userId: string, deckId: string): Promise<Flashcard[]> {
    const cardsRef = collection(db, "users", userId, "decks", deckId, "cards");
    const q = query(cardsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        deckId,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
    })) as Flashcard[];
}

// 获取单个卡片
export async function getCard(
    userId: string,
    deckId: string,
    cardId: string
): Promise<Flashcard | null> {
    const cardRef = doc(db, "users", userId, "decks", deckId, "cards", cardId);
    const cardSnap = await getDoc(cardRef);

    if (!cardSnap.exists()) return null;

    const data = cardSnap.data();
    return {
        id: cardSnap.id,
        deckId,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    } as Flashcard;
}

// 创建卡片
export async function createCard(
    userId: string,
    deckId: string,
    front: string,
    back: string,
    difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<string> {
    const cardsRef = collection(db, "users", userId, "decks", deckId, "cards");
    const docRef = await addDoc(cardsRef, {
        front,
        back,
        difficulty,
        createdAt: serverTimestamp(),
    });

    // 更新卡组卡片数量
    const cards = await getDeckCards(userId, deckId);
    await updateDeckCardCount(userId, deckId, cards.length);

    return docRef.id;
}

// 批量创建卡片
export async function createCardsInBatch(
    userId: string,
    deckId: string,
    cards: Array<{ front: string; back: string }>
): Promise<void> {
    const batch = writeBatch(db);
    const cardsRef = collection(db, "users", userId, "decks", deckId, "cards");

    cards.forEach((card) => {
        const newCardRef = doc(cardsRef);
        batch.set(newCardRef, {
            front: card.front,
            back: card.back,
            difficulty: "medium",
            createdAt: serverTimestamp(),
        });
    });

    await batch.commit();

    // 更新卡组卡片数量
    const allCards = await getDeckCards(userId, deckId);
    await updateDeckCardCount(userId, deckId, allCards.length);
}

// 更新卡片
export async function updateCard(
    userId: string,
    deckId: string,
    cardId: string,
    updates: Partial<Pick<Flashcard, "front" | "back" | "difficulty">>
): Promise<void> {
    const cardRef = doc(db, "users", userId, "decks", deckId, "cards", cardId);
    await updateDoc(cardRef, updates);
}

// 删除卡片
export async function deleteCard(
    userId: string,
    deckId: string,
    cardId: string
): Promise<void> {
    const cardRef = doc(db, "users", userId, "decks", deckId, "cards", cardId);
    await deleteDoc(cardRef);

    // 更新卡组卡片数量
    const cards = await getDeckCards(userId, deckId);
    await updateDeckCardCount(userId, deckId, cards.length);
}
