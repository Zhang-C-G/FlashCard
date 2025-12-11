<script setup>
import { ref, computed } from 'vue'
import { useCardStore } from '@/stores/cardStore'

const cardStore = useCardStore()

const searchQuery = ref('')
const selectedCategory = ref('')

const filteredCards = computed(() => {
  let cards = cardStore.allCards
  
  if (selectedCategory.value) {
    cards = cards.filter(c => c.category === selectedCategory.value)
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    cards = cards.filter(c => 
      c.front.toLowerCase().includes(q) ||
      c.back.toLowerCase().includes(q)
    )
  }
  
  return cards
})

function deleteCard(id) {
  if (confirm('Supprimer cette carte ?')) {
    cardStore.deleteCard(id)
  }
}

function toggleFavorite(id) {
  cardStore.toggleFavorite(id)
}
</script>

<template>
  <div class="manage-view">
    <header class="view-header">
      <h1>📋 Gérer les cartes</h1>
      <router-link to="/add" class="btn btn-primary">
        ➕ Ajouter
      </router-link>
    </header>

    <!-- Filters -->
    <div class="filters">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="🔍 Rechercher..."
        class="search-input"
      />
      <select v-model="selectedCategory" class="category-select">
        <option value="">Toutes les catégories</option>
        <option v-for="cat in cardStore.categories" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>

    <!-- Stats -->
    <div class="stats-bar">
      <span>📊 {{ filteredCards.length }} cartes</span>
      <span>⏰ {{ cardStore.stats.due }} à réviser</span>
      <span>🎯 {{ cardStore.stats.mastered }} maîtrisées</span>
    </div>

    <!-- Card list -->
    <div class="card-list">
      <div v-if="filteredCards.length === 0" class="empty-state">
        <p>Aucune carte trouvée</p>
        <router-link to="/add" class="btn btn-primary">
          ➕ Ajouter une carte
        </router-link>
      </div>

      <div 
        v-for="card in filteredCards" 
        :key="card.id" 
        class="card-item"
      >
        <div class="card-info">
          <span class="category">{{ card.category }}</span>
          <h3>{{ card.front }}</h3>
          <p>{{ card.back }}</p>
          <div class="tags">
            <span v-for="tag in card.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
        <div class="card-actions">
          <button @click="toggleFavorite(card.id)" class="action-btn">
            {{ card.favorite ? '⭐' : '☆' }}
          </button>
          <button @click="deleteCard(card.id)" class="action-btn delete">
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manage-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.view-header {
  padding: 1.5rem 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.filters {
  padding: 1rem 2rem;
  background: white;
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #eee;
}

.search-input, .category-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input {
  flex: 1;
}

.stats-bar {
  padding: 1rem 2rem;
  background: #667eea;
  color: white;
  display: flex;
  gap: 2rem;
  font-size: 0.9rem;
}

.card-list {
  padding: 1rem 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.card-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-info {
  flex: 1;
}

.category {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.card-info h3 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.card-info p {
  color: #666;
  margin: 0;
}

.tags {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.tag {
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #666;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #f0f0f0;
}

.action-btn.delete:hover {
  background: #fee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>
