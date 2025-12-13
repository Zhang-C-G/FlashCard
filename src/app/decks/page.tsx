"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeckCard } from "@/components/flashcard/deck-card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { getUserDecks, createDeck, updateDeck } from "@/lib/services/deck-service";
import { importDeck, validateImportData, type ExportData } from "@/lib/services/import-export-service";
import type { Deck } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";

export default function DecksPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [decks, setDecks] = React.useState<Deck[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [newDeckName, setNewDeckName] = React.useState("");
    const [newDeckDesc, setNewDeckDesc] = React.useState("");
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [isCreating, setIsCreating] = React.useState(false);

    // 导入相关状态
    const [importDialogOpen, setImportDialogOpen] = React.useState(false);
    const [importPreview, setImportPreview] = React.useState<ExportData | null>(null);
    const [isImporting, setIsImporting] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // 加载用户卡组
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
            } catch (error) {
                console.error("Failed to load decks:", error);
                toast.error("加载卡组失败");
            } finally {
                setIsLoading(false);
            }
        }

        if (!authLoading) {
            loadDecks();
        }
    }, [user, authLoading]);

    const filteredDecks = decks.filter(
        (deck) =>
            deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            deck.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateDeck = async () => {
        if (!newDeckName.trim() || !user) return;

        setIsCreating(true);
        try {
            const deckId = await createDeck(
                user.uid,
                newDeckName.trim(),
                newDeckDesc.trim() || "无描述"
            );

            const newDeck: Deck = {
                id: deckId,
                name: newDeckName.trim(),
                description: newDeckDesc.trim() || "无描述",
                cardCount: 0,
                createdAt: new Date(),
            };

            setDecks([newDeck, ...decks]);
            setNewDeckName("");
            setNewDeckDesc("");
            setDialogOpen(false);
            toast.success("卡组创建成功");
        } catch (error) {
            console.error("Failed to create deck:", error);
            toast.error("创建卡组失败");
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateDeck = async (id: string, name: string, description: string) => {
        if (!user) return;

        try {
            await updateDeck(user.uid, id, { name, description });
            setDecks(decks.map(deck =>
                deck.id === id ? { ...deck, name, description } : deck
            ));
            toast.success("卡组更新成功");
        } catch (error) {
            console.error("Failed to update deck:", error);
            toast.error("更新卡组失败");
        }
    };

    const handleResetDeck = (id: string) => {
        // 重置后更新卡组进度显示
        setDecks(decks.map(deck =>
            deck.id === id ? { ...deck, progress: 0, lastStudied: undefined } : deck
        ));
    };

    const handleCardsPerSessionChange = async (id: string, count: number) => {
        if (!user) return;
        try {
            // 更新 Firestore
            await updateDeck(user.uid, id, { cardsPerSession: count } as any);
            // 更新本地状态
            setDecks(decks.map(deck =>
                deck.id === id ? { ...deck, cardsPerSession: count } : deck
            ));
        } catch (error) {
            console.error("Failed to update cards per session:", error);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text) as ExportData;

            // 验证数据
            const validation = validateImportData(data);
            if (!validation.valid) {
                toast.error(validation.error || "数据格式错误");
                return;
            }

            setImportPreview(data);
            setImportDialogOpen(true);
        } catch (error) {
            console.error("Failed to read file:", error);
            toast.error("读取文件失败，请确保是有效的 JSON 文件");
        }

        // 清空 input，允许再次选择同一文件
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleImport = async () => {
        if (!user || !importPreview) return;

        setIsImporting(true);
        try {
            const result = await importDeck(user.uid, importPreview);
            toast.success(`已导入 ${result.imported} 张卡片`);

            // 刷新卡组列表
            const userDecks = await getUserDecks(user.uid);
            setDecks(userDecks);

            setImportDialogOpen(false);
            setImportPreview(null);
        } catch (error) {
            console.error("Failed to import deck:", error);
            toast.error("导入失败");
        } finally {
            setIsImporting(false);
        }
    };

    // 未登录状态
    if (!authLoading && !user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <h2 className="text-xl font-semibold mb-4">请先登录</h2>
                    <p className="text-muted-foreground mb-6">登录后即可管理你的卡组</p>
                    <Button asChild>
                        <Link href="/login">去登录</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // 加载状态
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
                    <h1 className="text-3xl font-bold tracking-tight">卡组</h1>
                    <p className="text-muted-foreground mt-1">管理你的学习卡组</p>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                    >
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
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                        </svg>
                        导入卡组
                    </Button>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
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
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                新建卡组
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>创建新卡组</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">卡组名称</label>
                                    <Input
                                        value={newDeckName}
                                        onChange={(e) => setNewDeckName(e.target.value)}
                                        placeholder="例如：JavaScript 基础"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">描述</label>
                                    <Input
                                        value={newDeckDesc}
                                        onChange={(e) => setNewDeckDesc(e.target.value)}
                                        placeholder="简短描述这个卡组的内容"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    disabled={isCreating}
                                >
                                    取消
                                </Button>
                                <Button
                                    onClick={handleCreateDeck}
                                    disabled={!newDeckName.trim() || isCreating}
                                >
                                    {isCreating ? "创建中..." : "创建"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="搜索卡组 ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {/* Decks Grid */}
            {filteredDecks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDecks.map((deck) => (
                        <DeckCard
                            key={deck.id}
                            deck={deck}
                            progress={deck.progress || 0}
                            onUpdate={handleUpdateDeck}
                            onReset={handleResetDeck}
                            onCardsPerSessionChange={handleCardsPerSessionChange}
                        />
                    ))}
                </div>
            ) : decks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map((deck) => (
                        <DeckCard
                            key={deck.id}
                            deck={deck}
                            progress={deck.progress || 0}
                            onUpdate={handleUpdateDeck}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border border-dashed border-border">
                    <p className="text-muted-foreground mb-4">
                        {searchQuery ? "没有找到匹配的卡组" : "还没有任何卡组"}
                    </p>
                    {!searchQuery && (
                        <Button onClick={() => setDialogOpen(true)}>
                            创建第一个卡组
                        </Button>
                    )}
                </div>
            )}

            {/* Import Dialog */}
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>导入卡组</DialogTitle>
                    </DialogHeader>
                    {importPreview && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">卡组信息</p>
                                <div className="p-3 border border-border bg-muted/50">
                                    <p className="font-medium">{importPreview.deck.name}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {importPreview.deck.description}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        包含 {importPreview.cards.length} 张卡片
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                导入后将创建一个新的卡组，不会影响现有卡组。
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setImportDialogOpen(false);
                                setImportPreview(null);
                            }}
                            disabled={isImporting}
                        >
                            取消
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={isImporting}
                        >
                            {isImporting ? "导入中..." : "导入"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
