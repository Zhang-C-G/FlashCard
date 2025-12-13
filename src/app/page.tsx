"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeckCard } from "@/components/flashcard/deck-card";
import { useAuth } from "@/contexts/auth-context";
import { getUserDecks, updateDeck } from "@/lib/services/deck-service";
import type { Deck } from "@/lib/types";

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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
        // 只显示最近3个卡组
        setDecks(userDecks.slice(0, 3));
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

  const handleUpdateDeck = async (id: string, name: string, description: string) => {
    if (!user) return;

    try {
      await updateDeck(user.uid, id, { name, description });
      setDecks(decks.map(deck =>
        deck.id === id ? { ...deck, name, description } : deck
      ));
    } catch (error) {
      console.error("Failed to update deck:", error);
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
      await updateDeck(user.uid, id, { cardsPerSession: count } as any);
      setDecks(decks.map(deck =>
        deck.id === id ? { ...deck, cardsPerSession: count } : deck
      ));
    } catch (error) {
      console.error("Failed to update cards per session:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 border-b border-border mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          FlashCard
        </h1>
      </section>

      {/* Recent Decks */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">最近卡组</h2>
          <Button variant="outline" asChild>
            <Link href="/decks">查看全部</Link>
          </Button>
        </div>

        {authLoading || isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : !user ? (
          <div className="text-center py-12 border border-dashed border-border">
            <p className="text-muted-foreground mb-4">登录后查看你的卡组</p>
            <Button asChild>
              <Link href="/login">去登录</Link>
            </Button>
          </div>
        ) : decks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
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
        ) : (
          <div className="text-center py-12 border border-dashed border-border">
            <p className="text-muted-foreground mb-4">还没有任何卡组</p>
            <Button asChild>
              <Link href="/decks">创建第一个卡组</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
