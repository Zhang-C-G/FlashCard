<script setup>
import { ref } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  showAnswer: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['flip', 'answer', 'favorite'])

const isFlipped = ref(false)

function flip() {
  isFlipped.value = !isFlipped.value
  emit('flip', isFlipped.value)
}

function answer(quality) {
  emit('answer', quality)
  isFlipped.value = false
}
</script>

<template>
  <div class="flashcard" :class="{ flipped: isFlipped }">
    <!-- Front -->
    <div class="card-face card-front" @click="flip">
      <div class="card-content">
        <span class="category-badge">{{ card.category }}</span>
        <button class="favorite-btn" @click.stop="emit('favorite', card.id)">
          {{ card.favorite ? '⭐' : '☆' }}
        </button>
        <h2 class="card-text">{{ card.front }}</h2>
        <p v-if="card.hint" class="hint">💡 {{ card.hint }}</p>
        <p class="tap-hint">Cliquez pour voir la réponse</p>
      </div>
    </div>

    <!-- Back -->
    <div class="card-face card-back" @click="flip">
      <div class="card-content">
        <h2 class="card-text">{{ card.back }}</h2>
        
        <!-- Answer buttons -->
        <div class="answer-buttons" @click.stop>
          <button class="btn btn-again" @click="answer('again')">
            🔄 À revoir
          </button>
          <button class="btn btn-hard" @click="answer('hard')">
            😓 Difficile
          </button>
          <button class="btn btn-good" @click="answer('good')">
            👍 Correct
          </button>
          <button class="btn btn-easy" @click="answer('easy')">
            🎯 Facile
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flashcard {
  width: 100%;
  max-width: 500px;
  height: 350px;
  perspective: 1000px;
  cursor: pointer;
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.6s;
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-back {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  transform: rotateY(180deg);
}

.flashcard.flipped .card-front {
  transform: rotateY(180deg);
}

.flashcard.flipped .card-back {
  transform: rotateY(0deg);
}

.card-content {
  padding: 2rem;
  text-align: center;
  width: 100%;
}

.category-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.favorite-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.card-text {
  font-size: 1.8rem;
  margin: 1rem 0;
  line-height: 1.4;
}

.hint {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 1rem;
}

.tap-hint {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  opacity: 0.6;
}

.answer-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.btn:hover {
  transform: scale(1.05);
}

.btn-again { background: #e74c3c; color: white; }
.btn-hard { background: #f39c12; color: white; }
.btn-good { background: #27ae60; color: white; }
.btn-easy { background: #3498db; color: white; }
</style>
