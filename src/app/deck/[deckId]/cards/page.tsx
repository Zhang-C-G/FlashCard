"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { getDeck } from "@/lib/services/deck-service";
import { getDeckCards, updateCard, deleteCard } from "@/lib/services/card-service";
import { exportDeck, downloadJSON } from "@/lib/services/import-export-service";
import type { Flashcard, Deck } from "@/lib/types";
import { toast } from "sonner";

export default function CardsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const deckId = params.deckId as string;

    const [deck, setDeck] = React.useState<Deck | null>(null);
    const [cards, setCards] = React.useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [editingCard, setEditingCard] = React.useState<Flashcard | null>(null);
    const [editFront, setEditFront] = React.useState("");
    const [editBack, setEditBack] = React.useState("");

    // 加载数据
    React.useEffect(() => {
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
            } catch (error) {
                console.error("Failed to load cards:", error);
                toast.error("加载失败");
            } finally {
                setIsLoading(false);
            }
        }

        if (!authLoading) {
            loadData();
        }
    }, [user, authLoading, deckId, router]);

    const filteredCards = cards.filter(
        (card) =>
            card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.back.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            // 更新进度（虽然编辑内容不影响，但为了保险起见）
            import("@/lib/services/study-service").then(({ updateDeckProgress }) => {
                updateDeckProgress(user.uid, deckId).catch(console.error);
            });

            toast.success("卡片已更新");
        } catch (error) {
            console.error("Failed to update card:", error);
            toast.error("更新失败");
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!user) return;

        try {
            await deleteCard(user.uid, deckId, cardId);
            setCards(cards.filter(c => c.id !== cardId));

            // 删除卡片后更新进度
            import("@/lib/services/study-service").then(({ updateDeckProgress }) => {
                updateDeckProgress(user.uid, deckId).catch(console.error);
            });

            toast.success("卡片已删除");
        } catch (error) {
            console.error("Failed to delete card:", error);
            toast.error("删除失败");
        }
    };

    const handleExport = async () => {
        if (!user || !deck) return;

        try {
            const exportData = await exportDeck(user.uid, deckId);
            const filename = `${deck.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
            downloadJSON(exportData, filename);
            toast.success("卡组已导出");
        } catch (error) {
            console.error("Failed to export deck:", error);
            toast.error("导出失败");
        }
    };

    // 未登录
    if (!authLoading && !user) {
        return (
            <div className="container mx-auto px-4 py-8">
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
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <p className="text-muted-foreground">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/decks">
                                <svg
                                    className="w-4 h-4 mr-1"
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
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{deck?.name}</h1>
                    <p className="text-muted-foreground mt-1">
                        共 {cards.length} 张卡片
                    </p>
                </div>

                <Button variant="outline" size="sm" onClick={handleExport}>
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    导出卡组
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="搜索卡片..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {/* Cards List */}
            {filteredCards.length > 0 ? (
                <div className="space-y-3">
                    {filteredCards.map((card, index) => (
                        <div
                            key={card.id}
                            className="group p-4 border border-border hover:border-foreground/20 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-muted-foreground">
                                            #{index + 1}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 ${card.difficulty === "easy"
                                            ? "bg-green-500/10 text-green-500"
                                            : card.difficulty === "hard"
                                                ? "bg-red-500/10 text-red-500"
                                                : "bg-yellow-500/10 text-yellow-500"
                                            }`}>
                                            {card.difficulty === "easy" ? "简单" :
                                                card.difficulty === "hard" ? "困难" : "一般"}
                                        </span>
                                    </div>
                                    <p className="font-medium mb-1">{card.front}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {card.back}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditCard(card)}
                                    >
                                        编辑
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() => handleDeleteCard(card.id)}
                                    >
                                        删除
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border border-dashed border-border">
                    <p className="text-muted-foreground mb-4">
                        {searchQuery ? "没有找到匹配的卡片" : "这个卡组还没有卡片"}
                    </p>
                    {!searchQuery && (
                        <Button asChild>
                            <Link href="/create">添加卡片</Link>
                        </Button>
                    )}
                </div>
            )}

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
