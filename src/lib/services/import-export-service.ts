import { getDeck } from "./deck-service";
import { getDeckCards, createCardsInBatch } from "./card-service";
import { createDeck } from "./deck-service";
import type { Deck, Flashcard } from "@/lib/types";

// 导出数据格式
export interface ExportData {
    version: string;
    exportedAt: string;
    deck: {
        name: string;
        description: string;
        cardCount: number;
        color?: string;
    };
    cards: Array<{
        front: string;
        back: string;
        difficulty: "easy" | "medium" | "hard";
        mastery?: number;
    }>;
}

/**
 * 导出卡组为 JSON 格式
 */
export async function exportDeck(
    userId: string,
    deckId: string
): Promise<ExportData> {
    // 获取卡组信息
    const deck = await getDeck(userId, deckId);
    if (!deck) {
        throw new Error("卡组不存在");
    }

    // 获取所有卡片
    const cards = await getDeckCards(userId, deckId);

    // 构建导出数据
    const exportData: ExportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        deck: {
            name: deck.name,
            description: deck.description,
            cardCount: cards.length,
            color: deck.color,
        },
        cards: cards.map((card) => ({
            front: card.front,
            back: card.back,
            difficulty: card.difficulty,
            mastery: card.mastery || 0,
        })),
    };

    return exportData;
}

/**
 * 下载 JSON 文件到本地
 */
export function downloadJSON(data: ExportData, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * 验证导入数据格式
 */
export function validateImportData(data: unknown): {
    valid: boolean;
    error?: string;
} {
    if (!data || typeof data !== "object") {
        return { valid: false, error: "无效的 JSON 数据" };
    }

    const importData = data as Partial<ExportData>;

    // 检查版本
    if (!importData.version) {
        return { valid: false, error: "缺少版本信息" };
    }

    // 检查卡组信息
    if (!importData.deck) {
        return { valid: false, error: "缺少卡组信息" };
    }

    if (!importData.deck.name || typeof importData.deck.name !== "string") {
        return { valid: false, error: "卡组名称无效" };
    }

    // 检查卡片数组
    if (!Array.isArray(importData.cards)) {
        return { valid: false, error: "卡片数据格式错误" };
    }

    // 验证每张卡片
    for (let i = 0; i < importData.cards.length; i++) {
        const card = importData.cards[i];
        if (!card.front || !card.back) {
            return {
                valid: false,
                error: `第 ${i + 1} 张卡片缺少正面或背面内容`,
            };
        }
    }

    return { valid: true };
}

/**
 * 导入卡组
 */
export async function importDeck(
    userId: string,
    data: ExportData,
    options: {
        mergeName?: boolean; // 如果已存在同名卡组，是否合并
    } = {}
): Promise<{ deckId: string; imported: number }> {
    // 验证数据
    const validation = validateImportData(data);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // 创建新卡组
    let deckName = data.deck.name;
    if (!options.mergeName) {
        // 添加时间戳避免重名
        deckName = `${data.deck.name} (导入 ${new Date().toLocaleDateString()})`;
    }

    const deckId = await createDeck(
        userId,
        deckName,
        data.deck.description || "导入的卡组"
    );

    // 批量创建卡片
    const cardsToImport = data.cards.map((card) => ({
        front: card.front,
        back: card.back,
        // 可选：是否保留原有的熟练度和难度
        // difficulty: card.difficulty,
        // mastery: card.mastery,
    }));

    await createCardsInBatch(userId, deckId, cardsToImport);

    return {
        deckId,
        imported: data.cards.length,
    };
}
