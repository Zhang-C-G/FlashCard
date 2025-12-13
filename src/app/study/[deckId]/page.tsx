"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flashcard as FlashcardComponent } from "@/components/flashcard/flashcard";
import { StudyControls } from "@/components/flashcard/study-controls";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { getDeck, updateDeckLastStudied } from "@/lib/services/deck-service";
import { getDeckCards, updateCard } from "@/lib/services/card-service";
import type { Flashcard, Deck } from "@/lib/types";
import { toast } from "sonner";

export default function StudyPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const deckId = params.deckId as string;

    const [deck, setDeck] = React.useState<Deck | null>(null);
    const [cards, setCards] = React.useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isFlipped, setIsFlipped] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(false);
    const [stats, setStats] = React.useState({ easy: 0, medium: 0, hard: 0 });
    // [NEW] 未保存的批量结果
    const [unsavedResults, setUnsavedResults] = React.useState<{ cardId: string; difficulty: "easy" | "medium" | "hard"; mastery: number }[]>([]);

    // 编辑相关状态
    const [editingCard, setEditingCard] = React.useState<Flashcard | null>(null);
    const [editFront, setEditFront] = React.useState("");
    const [editBack, setEditBack] = React.useState("");

    // [NEW] 恢复上次会话 (LocalStorage)
    React.useEffect(() => {
        if (!user || !deckId) return;
        const key = `study_session_${user.uid}_${deckId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const session = JSON.parse(saved);
                // 简单的校验，防止数据过期或不匹配
                if (session.currentIndex && session.currentIndex < cards.length) {
                    setCurrentIndex(session.currentIndex);
                    setStats(session.stats || { easy: 0, medium: 0, hard: 0 });
                    setUnsavedResults(session.results || []);
                    toast.info("已恢复上次的学习进度");
                }
            } catch (e) {
                console.error("Failed to restore session", e);
            }
        }
    }, [user, deckId, cards.length]); // cards.length 确保数据加载后再恢复

    // [NEW] 实时保存会话到 LocalStorage
    React.useEffect(() => {
        if (!user || !deckId) return;
        const key = `study_session_${user.uid}_${deckId}`;
        const session = {
            currentIndex,
            stats,
            results: unsavedResults
        };
        localStorage.setItem(key, JSON.stringify(session));
    }, [user, deckId, currentIndex, stats, unsavedResults]);

    // 加载卡组和卡片
    React.useEffect(() => {
        // ... existing load logic (keeping it as is, but ensuring we don't double fetch)
        // loadData implementation...
        async function loadData() {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const [deckData, cardsData] = await Promise.all([
                    getDeck(user.uid, deckId),
                    getDeckCards(user.uid, deckId),
                ]);

                if (!deckData) {
                    toast.error("卡组不存在");
                    router.push("/decks");
                    return;
                }

                setDeck(deckData);
                setCards(cardsData);
                // 注意：这里不在加载时更新 lastStudied，改为在完成或保存时更新
            } catch (error) {
                console.error("Failed to load study data:", error);
                toast.error("加载失败");
            } finally {
                setIsLoading(false);
            }
        }

        if (!authLoading) {
            loadData();
        }
    }, [user, authLoading, deckId, router]);

    const currentCard = cards[currentIndex];

    const handleRevealAnswer = () => {
        setIsFlipped(!isFlipped);
    };

    const handleRate = async (difficulty: "easy" | "medium" | "hard") => {
        if (!user || !cards[currentIndex]) return;

        const currentCard = cards[currentIndex];
        const currentMastery = currentCard.mastery || 0;
        let newMastery = currentMastery;

        // 1. 根据用户规则计算新的熟练度
        if (difficulty === "easy") {
            newMastery = Math.min(100, currentMastery + 50);
        } else if (difficulty === "medium") {
            newMastery = Math.min(100, currentMastery + 30);
        } else {
            // Hard: 归零
            newMastery = 0;
        }

        // 2. 更新当前卡片的熟练度（在内存状态中）
        // 注意：我们不修改原数组的引用，而是为了后续逻辑如果需要重插，使用新状态
        const updatedCard = { ...currentCard, mastery: newMastery };

        // 3. 将结果暂存到 unsavedResults (用于批量提交)
        const newResult = { cardId: currentCard.id, difficulty, mastery: newMastery };
        const newUnsavedResults = [...unsavedResults, newResult];

        // 更新 UI 统计
        setStats((prev) => ({ ...prev, [difficulty]: prev[difficulty] + 1 }));
        setUnsavedResults(newUnsavedResults);

        // 4. 判断是否需要重新复习 (In-session repeat)
        if (newMastery < 100) {
            // 如果熟练度未满 100，这张卡片需要在本次学习中再次出现
            setCards(prevCards => {
                const nextCards = [...prevCards];

                // 此时 currentIndex 指向当前这张卡。
                // 我们要把 updatedCard 插入到后面 20~30 张的位置
                // 随机偏移 20-30
                const offset = 20 + Math.floor(Math.random() * 11);
                let insertIndex = currentIndex + 1 + offset;

                // 如果队列不够长，就放到最后
                if (insertIndex >= nextCards.length) {
                    nextCards.push(updatedCard);
                } else {
                    nextCards.splice(insertIndex, 0, updatedCard);
                }

                return nextCards;
            });
            // 提示用户卡片稍后会出现
            if (difficulty === "hard") {
                toast.info("卡片熟练度归零，稍后将重新复习");
            }
        }

        // 更新当前卡片在数组中的状态，确保如果它不再出现，其状态也是最新的
        // 主要是为了防止回溯或其他逻辑读取旧状态（虽然这里主要是单向流）
        setCards(prevCards => {
            const nextCards = [...prevCards];
            nextCards[currentIndex] = updatedCard;
            return nextCards;
        });


        // 5. 触发批量保存 (每30条)
        if (newUnsavedResults.length >= 30) {
            import("@/lib/services/study-service").then(({ saveStudySession, updateDeckProgress }) => {
                saveStudySession(user.uid, deckId, newUnsavedResults)
                    .then(() => {
                        updateDeckProgress(user.uid, deckId);
                        setUnsavedResults([]);
                        toast.success("进度已自动保存");
                    })
                    .catch(err => {
                        console.error("Auto-save failed:", err);
                    });
            });
        }

        // 6. 页面跳转逻辑
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            // 队列学完了
            setIsLoading(true);
            try {
                const { saveStudySession, updateDeckProgress } = await import("@/lib/services/study-service");
                await saveStudySession(user.uid, deckId, newUnsavedResults);
                await updateDeckProgress(user.uid, deckId);

                localStorage.removeItem(`study_session_${user.uid}_${deckId}`);
                setUnsavedResults([]);
                setIsCompleted(true);
            } catch (err) {
                console.error("Final save failed:", err);
                toast.error("保存失败，请重试");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsCompleted(false);
        setStats({ easy: 0, medium: 0, hard: 0 });
    };

    const handleEditCard = (card: Flashcard) => {
        setEditingCard(card);
        setEditFront(card.front);
        setEditBack(card.back);
    };

    const handleSaveEdit = async () => {
        if (!editingCard || !user) return;

        try {
            await updateCard(user.uid, deckId, editingCard.id, {
                front: editFront,
                back: editBack,
            });

            setCards(cards.map(c =>
                c.id === editingCard.id
                    ? { ...c, front: editFront, back: editBack }
                    : c
            ));

            setEditingCard(null);
            toast.success("卡片已更新");
        } catch (error) {
            console.error("Failed to update card:", error);
            toast.error("更新失败");
        }
    };

    // 未登录
    if (!authLoading && !user) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center py-16">
                    <h2 className="text-xl font-semibold mb-4">请先登录</h2>
                    <Button asChild>
                        <Link href="/login">去登录</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // 加载中
    if (authLoading || isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center py-16">
                    <p className="text-muted-foreground">加载中...</p>
                </div>
            </div>
        );
    }

    // 没有卡片
    if (cards.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl overflow-hidden">
                <div className="text-center py-16">
                    <h2 className="text-xl font-semibold mb-4">这个卡组还没有卡片</h2>
                    <p className="text-muted-foreground mb-6">添加一些卡片开始学习</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/decks">返回卡组</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/create">创建卡片</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 学习完成
    if (isCompleted) {
        // 更新卡组进度
        if (user && deckId) {
            import("@/lib/services/study-service").then(({ updateDeckProgress }) => {
                updateDeckProgress(user.uid, deckId).catch(console.error);
            });
        }

        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl overflow-hidden">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold mb-4">🎉 学习完成！</h2>
                    <p className="text-muted-foreground mb-8">
                        你已完成 {deck?.name} 的学习
                    </p>

                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                        <div className="p-4 border border-border">
                            <p className="text-2xl font-bold text-green-500">{stats.easy}</p>
                            <p className="text-sm text-muted-foreground">简单</p>
                        </div>
                        <div className="p-4 border border-border">
                            <p className="text-2xl font-bold text-yellow-500">{stats.medium}</p>
                            <p className="text-sm text-muted-foreground">一般</p>
                        </div>
                        <div className="p-4 border border-border">
                            <p className="text-2xl font-bold text-red-500">{stats.hard}</p>
                            <p className="text-sm text-muted-foreground">困难</p>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={handleRestart}>
                            再学一次
                        </Button>
                        <Button asChild>
                            <Link href="/decks">返回卡组</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/decks">
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        返回
                    </Link>
                </Button>
                <Button variant="link" onClick={handleRestart}>
                    重新开始
                </Button>
            </div>

            {/* Flashcard */}
            <div className="mb-8">
                <FlashcardComponent
                    card={currentCard}
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped(!isFlipped)}
                    onEdit={handleEditCard}
                />
            </div>

            {/* Study Controls */}
            <StudyControls
                currentCard={currentIndex + 1}
                totalCards={cards.length}
                isAnswerRevealed={isFlipped}
                onRevealAnswer={handleRevealAnswer}
                onRate={handleRate}
            />

            {/* Edit Dialog */}
            <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>编辑卡片</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">问题</label>
                            <textarea
                                value={editFront}
                                onChange={(e) => setEditFront(e.target.value)}
                                className="w-full min-h-[100px] p-3 border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">答案</label>
                            <textarea
                                value={editBack}
                                onChange={(e) => setEditBack(e.target.value)}
                                className="w-full min-h-[100px] p-3 border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingCard(null)}>
                            取消
                        </Button>
                        <Button onClick={handleSaveEdit}>
                            保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
