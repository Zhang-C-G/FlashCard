import type { Deck } from "@/lib/types";

// Mock data for demonstration
const mockDecks: Deck[] = [
    {
        id: "1",
        name: "JavaScript 基础",
        description: "变量、函数、对象等核心概念",
        cardCount: 42,
        createdAt: new Date("2024-01-15"),
        lastStudied: new Date("2024-12-10"),
    },
    {
        id: "2",
        name: "React Hooks",
        description: "useState, useEffect, useContext 等",
        cardCount: 28,
        createdAt: new Date("2024-02-20"),
        lastStudied: new Date("2024-12-08"),
    },
    {
        id: "3",
        name: "TypeScript 类型",
        description: "泛型、类型推断、工具类型",
        cardCount: 35,
        createdAt: new Date("2024-03-10"),
    },
];

export const mockData = {
    decks: mockDecks,
};
