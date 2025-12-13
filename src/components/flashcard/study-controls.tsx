"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface StudyControlsProps {
    isAnswerRevealed: boolean;
    onRevealAnswer: () => void;
    onRate: (difficulty: "easy" | "medium" | "hard") => void;
    currentCard: number;
    totalCards: number;
    className?: string;
}

export function StudyControls({
    isAnswerRevealed,
    onRevealAnswer,
    onRate,
    currentCard,
    totalCards,
    className,
}: StudyControlsProps) {
    const progress = totalCards > 0 ? (currentCard / totalCards) * 100 : 0;

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 空格键和回车键始终用于翻转/显示答案
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onRevealAnswer();
            }
            // 1/2/3 用于评分（只在答案显示后有效）
            if (isAnswerRevealed) {
                if (e.key === "1") onRate("hard");
                if (e.key === "2") onRate("medium");
                if (e.key === "3") onRate("easy");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isAnswerRevealed, onRevealAnswer, onRate]);

    return (
        <div className={cn("w-full max-w-2xl mx-auto space-y-6", className)}>
            {/* Progress */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">进度</span>
                    <span className="font-medium">
                        {currentCard} / {totalCards}
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center space-y-4">
                {!isAnswerRevealed ? (
                    <Button
                        size="lg"
                        onClick={onRevealAnswer}
                        className="w-full max-w-xs"
                    >
                        显示答案
                    </Button>
                ) : (
                    <div className="w-full max-w-md mx-auto space-y-3">
                        <p className="text-center text-sm text-muted-foreground">
                            你的掌握程度如何？
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onRate("hard")}
                                className="flex flex-col py-4 h-auto"
                            >
                                <span className="text-sm">困难</span>
                                <span className="text-[10px] text-muted-foreground">[1]</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => onRate("medium")}
                                className="flex flex-col py-4 h-auto"
                            >
                                <span className="text-sm">一般</span>
                                <span className="text-[10px] text-muted-foreground">[2]</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => onRate("easy")}
                                className="flex flex-col py-4 h-auto"
                            >
                                <span className="text-sm">简单</span>
                                <span className="text-[10px] text-muted-foreground">[3]</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
