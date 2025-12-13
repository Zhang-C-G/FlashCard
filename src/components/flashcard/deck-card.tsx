"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { resetDeckProgress } from "@/lib/services/deck-service";
import type { Deck } from "@/lib/types";
import { toast } from "sonner";

interface DeckCardProps {
    deck: Deck;
    progress?: number;
    className?: string;
    onUpdate?: (id: string, name: string, description: string) => void;
    onReset?: (id: string) => void;
    onCardsPerSessionChange?: (id: string, count: number) => void;
}

export function DeckCard({ deck, progress = 0, className, onUpdate, onReset, onCardsPerSessionChange }: DeckCardProps) {
    const { user } = useAuth();
    const [isFlipped, setIsFlipped] = React.useState(false);
    const [editName, setEditName] = React.useState(deck.name);
    const [editDescription, setEditDescription] = React.useState(deck.description);
    const [showResetDialog, setShowResetDialog] = React.useState(false);
    const [cardsPerSession, setCardsPerSession] = React.useState(deck.cardsPerSession || 20);


    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFlipped(true);
    };

    const handleResetClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowResetDialog(true);
    };

    const handleConfirmReset = async () => {
        if (!user) return;
        try {
            await resetDeckProgress(user.uid, deck.id);
            toast.success("进度已重置");
            onReset?.(deck.id);
        } catch (error) {
            console.error("Failed to reset progress:", error);
            toast.error("重置失败");
        } finally {
            setShowResetDialog(false);
        }
    };

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onUpdate?.(deck.id, editName, editDescription);
        setIsFlipped(false);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditName(deck.name);
        setEditDescription(deck.description);
        setIsFlipped(false);
    };

    const handleCardsPerSessionChange = (count: number) => {
        setCardsPerSession(count);
        onCardsPerSessionChange?.(deck.id, count);
        toast.success(`已设置每次复习 ${count} 张卡片`);
    };

    const cardBase = "h-full border border-border bg-card text-card-foreground flex flex-col";

    return (
        <div
            className={cn("h-[260px] overflow-hidden", className)}
            style={{ perspective: "1000px" }}
        >
            <div
                className="relative w-full h-full transition-transform duration-500"
                style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
            >
                {/* Front - Display */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <div className={cn(cardBase, "transition-colors hover:bg-accent/50")}>
                        {/* Header */}
                        <div className="p-4 pb-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg leading-tight truncate">
                                        {deck.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {deck.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Badge variant="secondary">{deck.cardCount} 张</Badge>

                                    {/* 复习数量控制 */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={(e) => e.stopPropagation()}
                                                title="设置复习数量"
                                            >
                                                <svg
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                    />
                                                </svg>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenuItem onClick={() => handleCardsPerSessionChange(10)}>
                                                10 张/次 {cardsPerSession === 10 && "✓"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleCardsPerSessionChange(20)}>
                                                20 张/次 {cardsPerSession === 20 && "✓"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleCardsPerSessionChange(30)}>
                                                30 张/次 {cardsPerSession === 30 && "✓"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleCardsPerSessionChange(50)}>
                                                50 张/次 {cardsPerSession === 50 && "✓"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* 重置进度按钮 */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={handleResetClick}
                                        title="重置进度"
                                    >
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                        </svg>
                                    </Button>

                                    {/* 编辑按钮 */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={handleEditClick}
                                    >
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <Link href={`/study/${deck.id}`} className="flex-1 flex flex-col">
                            <div className="px-4 pb-2 flex-1">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">学习进度</span>
                                        <span className="font-medium">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-1.5" />
                                </div>
                            </div>
                        </Link>

                        {/* Footer */}
                        <div className="px-4 pb-4 pt-2 flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                {deck.lastStudied
                                    ? `上次学习: ${new Date(deck.lastStudied).toLocaleDateString("zh-CN")}`
                                    : "尚未开始学习"}
                            </p>
                            <Link
                                href={`/deck/${deck.id}/cards`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                查看卡片
                                <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Back - Edit Form */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                >
                    <div className={cardBase}>
                        {/* Header */}
                        <div className="p-4 pb-3">
                            <h3 className="font-semibold text-lg leading-tight">
                                编辑卡组
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="px-4 flex-1 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">卡组名称</label>
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">描述</label>
                                <Input
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 pb-4 pt-4 flex gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={handleCancel}
                            >
                                取消
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1"
                                onClick={handleSave}
                                disabled={!editName.trim()}
                            >
                                保存
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reset Confirmation Dialog */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认重置进度？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作将清零卡组 <strong>{deck.name}</strong> 的所有学习进度，包括每张卡片的熟练度和难度。此操作无法撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmReset}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            确认重置
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
