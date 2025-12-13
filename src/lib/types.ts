// Flashcard types
export interface Flashcard {
    id: string;
    front: string;
    back: string;
    deckId: string;
    createdAt: Date;
    lastReviewed?: Date;
    nextReview?: Date;
    difficulty: 'easy' | 'medium' | 'hard';
    mastery?: number; // 熟练度 0-100
}

// Deck types
export interface Deck {
    id: string;
    name: string;
    description: string;
    cardCount: number;
    createdAt: Date;
    progress?: number; // 学习进度 0-100
    lastStudiedAt?: Date;
    lastStudied?: Date;
    color?: string;
    cardsPerSession?: number; // 每次复习卡片数量，默认20
}

// Study session types
export interface StudySession {
    id: string;
    deckId: string;
    startTime: Date;
    endTime?: Date;
    cardsStudied: number;
    correctCount: number;
}

// Study result for a single card
export interface StudyResult {
    cardId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timestamp: Date;
}
