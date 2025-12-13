"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Flashcard as FlashcardType } from "@/lib/types";

interface FlashcardProps {
    card: FlashcardType;
    isFlipped?: boolean;
    onFlip?: () => void;
    onEdit?: (card: FlashcardType) => void;
    className?: string;
}

export function Flashcard({
    card,
    isFlipped = false,
    onFlip,
    onEdit,
    className,
}: FlashcardProps) {
    const [flipped, setFlipped] = React.useState(isFlipped);

    React.useEffect(() => {
        setFlipped(isFlipped);
    }, [isFlipped]);

    const handleFlip = () => {
        setFlipped(!flipped);
        onFlip?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleFlip();
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.(card);
    };

    return (
        <div
            className={cn("perspective-1000 w-full max-w-2xl mx-auto", className)}
            style={{ perspective: "1000px" }}
        >
            <div
                role="button"
                onClick={handleFlip}
                className={cn(
                    "relative w-full aspect-[3/2] cursor-pointer transition-transform duration-500",
                    "transform-style-preserve-3d"
                )}
                style={{
                    transformStyle: "preserve-3d",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
            >
                {/* Front of card */}
                <div
                    className={cn(
                        "absolute inset-0 w-full h-full",
                        "flex items-center justify-center p-8",
                        "border border-border bg-card text-card-foreground",
                        "backface-hidden"
                    )}
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {/* Edit Button */}
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 h-8 w-8 opacity-50 hover:opacity-100"
                            onClick={handleEditClick}
                        >
                            <svg
                                className="w-4 h-4"
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
                    )}
                    <div className="text-center">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                            问题
                        </p>
                        <p className="text-xl font-medium">{card.front}</p>
                    </div>
                </div>

                {/* Back of card */}
                <div
                    className={cn(
                        "absolute inset-0 w-full h-full overflow-hidden",
                        "flex items-center justify-center p-8",
                        "border border-border bg-card text-card-foreground",
                        "backface-hidden"
                    )}
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                >
                    {/* Edit Button */}
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 h-8 w-8 opacity-50 hover:opacity-100"
                            onClick={handleEditClick}
                        >
                            <svg
                                className="w-4 h-4"
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
                    )}
                    <div className="text-center">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                            答案
                        </p>
                        <p className="text-xl font-medium">{card.back}</p>
                    </div>
                </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
                点击卡片或按空格键翻转
            </p>
        </div>
    );
}
