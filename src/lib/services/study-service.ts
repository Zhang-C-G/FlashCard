import { db } from "../firebase";
import { collection, doc, getDocs, updateDoc, writeBatch } from "firebase/firestore";

interface StudyResult {
    cardId: string;
    difficulty: "easy" | "medium" | "hard";
    mastery: number;
}

/**
 * 批量保存学习结果
 * @param userId 用户ID
 * @param deckId 卡组ID
 * @param results 学习结果列表
 */
export async function saveStudySession(userId: string, deckId: string, results: StudyResult[]): Promise<void> {
    if (results.length === 0) return;

    try {
        const batch = writeBatch(db);

        results.forEach(result => {
            const cardRef = doc(db, "users", userId, "decks", deckId, "cards", result.cardId);
            batch.update(cardRef, {
                difficulty: result.difficulty,
                mastery: result.mastery,
                lastStudied: new Date()
            });
        });

        await batch.commit();
        console.log(`Saved ${results.length} results.`);
    } catch (error) {
        console.error("Error saving study session:", error);
        throw error;
    }
}

/**
 * 计算并更新卡组进度 (基于平均熟练度)
 * @param userId 用户ID
 * @param deckId 卡组ID
 */
export async function updateDeckProgress(userId: string, deckId: string): Promise<number> {
    try {
        // 1. 获取卡组下所有卡片
        const cardsRef = collection(db, "users", userId, "decks", deckId, "cards");
        const snapshot = await getDocs(cardsRef);

        if (snapshot.empty) {
            // 如果没有卡片，进度为 0
            await updateDoc(doc(db, "users", userId, "decks", deckId), { progress: 0 });
            return 0;
        }

        // 2. 计算平均熟练度
        let totalMastery = 0;
        const totalCards = snapshot.size;

        snapshot.forEach((doc) => {
            const data = doc.data();
            // 默认熟练度为 0
            const mastery = typeof data.mastery === 'number' ? data.mastery : 0;
            totalMastery += mastery;
        });

        const progress = Math.round(totalMastery / totalCards);

        // 3. 更新 Deck 文档
        await updateDoc(doc(db, "users", userId, "decks", deckId), {
            progress: progress,
            lastStudied: new Date()
        });

        return progress;
    } catch (error) {
        console.error("Error updating deck progress:", error);
        throw error;
    }
}
