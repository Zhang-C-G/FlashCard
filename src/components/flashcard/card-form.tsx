"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CardFormProps {
    onSubmit: (front: string, back: string) => void;
    onCancel?: () => void;
    initialFront?: string;
    initialBack?: string;
    isEditing?: boolean;
    className?: string;
}

export function CardForm({
    onSubmit,
    onCancel,
    initialFront = "",
    initialBack = "",
    isEditing = false,
    className,
}: CardFormProps) {
    const [front, setFront] = React.useState(initialFront);
    const [back, setBack] = React.useState(initialBack);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (front.trim() && back.trim()) {
            onSubmit(front.trim(), back.trim());
            if (!isEditing) {
                setFront("");
                setBack("");
            }
        }
    };

    return (
        <Card className={cn("w-full max-w-2xl mx-auto", className)}>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>{isEditing ? "编辑卡片" : "创建新卡片"}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="front"
                            className="text-sm font-medium leading-none"
                        >
                            正面（问题）
                        </label>
                        <Input
                            id="front"
                            value={front}
                            onChange={(e) => setFront(e.target.value)}
                            placeholder="输入问题..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="back" className="text-sm font-medium leading-none">
                            背面（答案）
                        </label>
                        <Input
                            id="back"
                            value={back}
                            onChange={(e) => setBack(e.target.value)}
                            placeholder="输入答案..."
                            className="min-h-[80px]"
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end space-x-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            取消
                        </Button>
                    )}
                    <Button type="submit" disabled={!front.trim() || !back.trim()}>
                        {isEditing ? "保存" : "添加卡片"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
