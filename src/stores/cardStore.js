import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Card } from '@/entities/Card'
import { cardApi } from '@/api/cardApi'

/**
 * Card Store - Gestion d'état avec Pinia
 * Supports both localStorage (offline) and API (online)
 */
export const useCardStore = defineStore('cards', () => {
  // State
  const cards = ref([])
  const currentCategory = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const useApi = ref(false) // Toggle between localStorage and API

  // Getters (computed)
  const allCards = computed(() => cards.value)
  
  const dueCards = computed(() => 
    cards.value.filter(card => card.isDue())
  )
  
  const cardsByCategory = computed(() => (category) => 
    cards.value.filter(card => card.category === category)
  )
  
  const categories = computed(() => 
    [...new Set(cards.value.map(card => card.category))]
  )
  
  const stats = computed(() => ({
    total: cards.value.length,
    new: cards.value.filter(c => c.isNew()).length,
    due: cards.value.filter(c => c.isDue()).length,
    mastered: cards.value.filter(c => c.getStatus() === 'mastered').length
  }))

  // ==================== Storage Actions ====================
  function loadFromStorage() {
    try {
      const data = localStorage.getItem('flashcard_cards')
      if (data) {
        const parsed = JSON.parse(data)
        cards.value = parsed.map(c => new Card(c))
        console.log(`📦 [CardStore] Loaded ${cards.value.length} cards from localStorage`)
      }
    } catch (e) {
      error.value = 'Erreur de chargement'
      console.error('[CardStore] Load error:', e)
    }
  }

  function saveToStorage() {
    try {
      const data = cards.value.map(c => c.toJSON())
      localStorage.setItem('flashcard_cards', JSON.stringify(data))
    } catch (e) {
      console.error('[CardStore] Save error:', e)
    }
  }

  // ==================== API Actions ====================
  async function fetchCards() {
    loading.value = true
    error.value = null
    try {
      const data = await cardApi.getAll()
      cards.value = data.map(c => new Card(c))
      console.log(`📦 [CardStore] Fetched ${cards.value.length} cards from API`)
    } catch (e) {
      error.value = 'Erreur de connexion au serveur'
      console.error('[CardStore] Fetch error:', e)
      // Fallback to localStorage
      loadFromStorage()
    } finally {
      loading.value = false
    }
  }

  async function fetchDueCards() {
    loading.value = true
    try {
      const data = await cardApi.getDue()
      return data.map(c => new Card(c))
    } catch (e) {
      console.error('[CardStore] Fetch due error:', e)
      return dueCards.value
    } finally {
      loading.value = false
    }
  }

  // ==================== CRUD Actions ====================
  async function addCard(cardData) {
    const card = new Card(cardData)
    const validation = card.validate()
    
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }
    
    if (useApi.value) {
      try {
        const created = await cardApi.create(cardData)
        cards.value.push(new Card(created))
        console.log(`➕ [CardStore] Card created via API: ${created.id}`)
        return new Card(created)
      } catch (e) {
        error.value = e.message
        throw e
      }
    } else {
      cards.value.push(card)
      saveToStorage()
      console.log(`➕ [CardStore] Card added locally: ${card.id}`)
      return card
    }
  }

  async function updateCard(id, updates) {
    const index = cards.value.findIndex(c => c.id === id)
    if (index === -1) return null
    
    if (useApi.value) {
      try {
        const updated = await cardApi.update(id, updates)
        cards.value[index] = new Card(updated)
        return cards.value[index]
      } catch (e) {
        error.value = e.message
        throw e
      }
    } else {
      Object.assign(cards.value[index], updates, {
        updatedAt: new Date().toISOString()
      })
      saveToStorage()
      return cards.value[index]
    }
  }

  async function deleteCard(id) {
    const index = cards.value.findIndex(c => c.id === id)
    if (index === -1) return false
    
    if (useApi.value) {
      try {
        await cardApi.delete(id)
        cards.value.splice(index, 1)
        console.log(`🗑️ [CardStore] Card deleted via API: ${id}`)
        return true
      } catch (e) {
        error.value = e.message
        throw e
      }
    } else {
      cards.value.splice(index, 1)
      saveToStorage()
      console.log(`🗑️ [CardStore] Card deleted locally: ${id}`)
      return true
    }
  }

  function getById(id) {
    return cards.value.find(c => c.id === id) || null
  }

  async function toggleFavorite(id) {
    const card = getById(id)
    if (card) {
      card.favorite = !card.favorite
      if (useApi.value) {
        await cardApi.update(id, { favorite: card.favorite })
      } else {
        saveToStorage()
      }
    }
    return card
  }

  // ==================== Mode Toggle ====================
  async function enableApiMode() {
    useApi.value = true
    await fetchCards()
  }

  function enableOfflineMode() {
    useApi.value = false
    loadFromStorage()
  }

  // Initialize with localStorage
  loadFromStorage()

  return {
    // State
    cards,
    currentCategory,
    loading,
    error,
    useApi,
    // Getters
    allCards,
    dueCards,
    cardsByCategory,
    categories,
    stats,
    // Actions
    loadFromStorage,
    fetchCards,
    fetchDueCards,
    addCard,
    updateCard,
    deleteCard,
    getById,
    toggleFavorite,
    enableApiMode,
    enableOfflineMode
  }
})
