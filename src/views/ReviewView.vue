<script setup>
import { ref, computed } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { SM2Service } from '@/services/SM2Service'
import FlashCard from '@/components/FlashCard.vue'

const cardStore = useCardStore()

const currentIndex = ref(0)

const dueCards = computed(() => cardStore.dueCards)
const currentCard = computed(() => dueCards.value[currentIndex.value] || null)
const progress = computed(() => ({
  current: currentIndex.value + 1,
  total: dueCards.value.length
}))

function handleAnswer(answer) {
  if (!currentCard.value) return
  
  const quality = SM2Service.answerToQuality(answer)
  const sm2Result = SM2Service.calculate(currentCard.value, quality)
  
  cardStore.updateCard(currentCard.value.id, sm2Result)
  
  // Next card
  if (currentIndex.value < dueCards.value.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

function handleFavorite(id) {
  cardStore.toggleFavorite(id)
}

function restart() {
  currentIndex.value = 0
}
</script>

<template>
  <div class="review-view">
    <header class="review-header">
      <h1>📚 Révision</h1>
      <div class="stats">
        <span class="stat">
          📊 {{ progress.current }} / {{ progress.total }}
        </span>
        <span class="stat">
          ⏰ {{ cardStore.stats.due }} à réviser
        </span>
      </div>
    </header>

    <main class="review-content">
      <!-- No cards -->
      <div v-if="dueCards.length === 0" class="empty-state">
        <h2>🎉 Félicitations !</h2>
        <p>Aucune carte à réviser pour le moment.</p>
        <router-link to="/add" class="btn btn-primary">
          ➕ Ajouter des cartes
        </router-link>
      </div>

      <!-- Card review -->
      <div v-else class="card-container">
        <FlashCard 
          :card="currentCard"
          @answer="handleAnswer"
          @favorite="handleFavorite"
        />
        
        <div class="navigation">
          <button class="btn btn-secondary" @click="restart">
            🔄 Recommencer
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.review-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.review-header {
  padding: 1.5rem 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  font-size: 0.9rem;
  color: #666;
}

.review-content {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.empty-state h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 2rem;
}

.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.navigation {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s;
}

.btn:hover {
  transform: scale(1.02);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}
</style>
