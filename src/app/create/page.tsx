"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { getUserDecks } from "@/lib/services/deck-service";
import { createCard, createCardsInBatch } from "@/lib/services/card-service";
import type { Deck } from "@/lib/types";
import { toast } from "sonner";

interface TempCard {
    id: string;
    front: string;
    back: string;
}

export default function CreatePage() {
    const { user, isLoading: authLoading } = useAuth();
    const [decks, setDecks] = React.useState<Deck[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const [selectedDeck, setSelectedDeck] = React.useState<Deck | null>(null);
    const [front, setFront] = React.useState("");
    const [back, setBack] = React.useState("");
    const [cards, setCards] = React.useState<TempCard[]>([]);
    const [bulkText, setBulkText] = React.useState("");
    const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    // 加载卡组
    React.useEffect(() => {
        async function loadDecks() {
            if (!user) {
                setDecks([]);
                setIsLoading(false);
                return;
            }

            try {
                const userDecks = await getUserDecks(user.uid);
                setDecks(userDecks);
                if (userDecks.length > 0) {
                    setSelectedDeck(userDecks[0]);
                }
            } catch (error) {
                console.error("Failed to load decks:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (!authLoading) {
            loadDecks();
        }
    }, [user, authLoading]);

    const handleAddCard = () => {
        if (front.trim() && back.trim()) {
            setCards([
                ...cards,
                {
                    id: String(Date.now()),
                    front: front.trim(),
                    back: back.trim(),
                },
            ]);
            setFront("");
            setBack("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey && e.key === "Enter") {
            e.preventDefault();
            handleAddCard();
        }
    };

    const handleBulkImport = () => {
        const lines = bulkText.trim().split("\n");
        const newCards: TempCard[] = [];

        lines.forEach((line) => {
            const parts = line.split(/\t|;;/);
            if (parts.length >= 2) {
                newCards.push({
                    id: String(Date.now() + Math.random()),
                    front: parts[0].trim(),
                    back: parts[1].trim(),
                });
            }
        });

        if (newCards.length > 0) {
            setCards([...cards, ...newCards]);
            setBulkText("");
            setBulkDialogOpen(false);
            toast.success(`已导入 ${newCards.length} 张卡片`);
        } else {
            toast.error("未找到有效的卡片数据");
        }
    };

    const handleRemoveCard = (id: string) => {
        setCards(cards.filter((c) => c.id !== id));
    };

    const handleSaveToDeck = async () => {
        if (!selectedDeck || !user || cards.length === 0) return;

        setIsSaving(true);
        try {
            await createCardsInBatch(
                user.uid,
                selectedDeck.id,
                cards.map(c => ({ front: c.front, back: c.back }))
            );

            toast.success(`已保存 ${cards.length} 张卡片到 ${selectedDeck.name}`);
            setCards([]);

            // 保存新卡片后更新进度（因为分母变了）
            import("@/lib/services/study-service").then(({ updateDeckProgress }) => {
                updateDeckProgress(user.uid, selectedDeck.id).catch(console.error);
            });
        } catch (error) {
            console.error("Failed to save cards:", error);
            toast.error("保存失败");
        } finally {
            setIsSaving(false);
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

    // 没有卡组
    if (decks.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <h2 className="text-xl font-semibold mb-4">还没有卡组</h2>
                    <p className="text-muted-foreground mb-6">请先创建一个卡组</p>
                    <Button asChild>
                        <Link href="/decks">创建卡组</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">创建卡片</h1>
                <p className="text-muted-foreground mt-1">添加新的学习卡片</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Input */}
                <div className="space-y-6">
                    {/* Deck Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">选择卡组</label>
                        <div className="flex flex-wrap gap-2">
                            {decks.map((deck) => (
                                <button
                                    key={deck.id}
                                    onClick={() => setSelectedDeck(deck)}
                                    className={`px-3 py-2 text-sm border transition-colors ${selectedDeck?.id === deck.id
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-border hover:border-foreground/50"
                                        }`}
                                >
                                    {deck.name}
                                    <span className="ml-2 text-xs opacity-60">
                                        {deck.cardCount}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Single Card Input */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">添加卡片</label>
                            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        批量导入
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>批量导入</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <p className="text-sm text-muted-foreground">
                                            每行一张卡片，问题和答案用 Tab 或 ;; 分隔
                                        </p>
                                        <textarea
                                            value={bulkText}
                                            onChange={(e) => setBulkText(e.target.value)}
                                            placeholder="问题1&#x9;答案1&#10;问题2;;答案2"
                                            className="w-full min-h-[200px] p-3 border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setBulkDialogOpen(false)}
                                        >
                                            取消
                                        </Button>
                                        <Button onClick={handleBulkImport}>
                                            导入
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="space-y-3">
                            <textarea
                                value={front}
                                onChange={(e) => setFront(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="问题（正面）"
                                className="w-full min-h-[80px] p-3 border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <textarea
                                value={back}
                                onChange={(e) => setBack(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="答案（背面）"
                                className="w-full min-h-[80px] p-3 border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    Ctrl + Enter 快速添加
                                </span>
                                <Button
                                    onClick={handleAddCard}
                                    disabled={!front.trim() || !back.trim()}
                                >
                                    添加卡片
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Preview */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                            待保存卡片
                            <span className="ml-2 text-muted-foreground">
                                ({cards.length})
                            </span>
                        </h3>
                        {cards.length > 0 && (
                            <Button
                                onClick={handleSaveToDeck}
                                disabled={!selectedDeck || isSaving}
                            >
                                {isSaving ? "保存中..." : `保存到 ${selectedDeck?.name}`}
                            </Button>
                        )}
                    </div>

                    {cards.length > 0 ? (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {cards.map((card, index) => (
                                <div
                                    key={card.id}
                                    className="p-3 border border-border group hover:border-foreground/20"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <span className="text-xs text-muted-foreground">
                                                #{index + 1}
                                            </span>
                                            <p className="font-medium text-sm mt-1">
                                                {card.front}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {card.back}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100"
                                            onClick={() => handleRemoveCard(card.id)}
                                        >
                                            删除
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border border-dashed border-border">
                            <p className="text-muted-foreground">
                                添加的卡片会显示在这里
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
