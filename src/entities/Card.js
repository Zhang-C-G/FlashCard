/**
 * Card Entity - Entité représentant une carte
 */
export class Card {
  constructor(data = {}) {
    this.id = data.id || Date.now()
    this.front = data.front || ''
    this.back = data.back || ''
    this.hint = data.hint || ''
    this.tags = data.tags || []
    this.category = data.category || 'default'
    this.favorite = data.favorite || false
    
    // SM2 Algorithm data
    this.interval = data.interval || 0
    this.repetition = data.repetition || 0
    this.easeFactor = data.easeFactor || 2.5
    this.nextReview = data.nextReview || null
    this.lastReview = data.lastReview || null
    
    // Metadata
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }

  validate() {
    const errors = []
    if (!this.front?.trim()) errors.push('Le recto est requis')
    if (!this.back?.trim()) errors.push('Le verso est requis')
    return { valid: errors.length === 0, errors }
  }

  isNew() {
    return this.repetition === 0
  }

  isDue() {
    if (!this.nextReview) return true
    return new Date(this.nextReview) <= new Date()
  }

  getStatus() {
    if (this.isNew()) return 'new'
    if (this.interval < 1) return 'learning'
    if (this.interval >= 21) return 'mastered'
    return 'review'
  }

  toJSON() {
    return {
      id: this.id,
      front: this.front,
      back: this.back,
      hint: this.hint,
      tags: this.tags,
      category: this.category,
      favorite: this.favorite,
      interval: this.interval,
      repetition: this.repetition,
      easeFactor: this.easeFactor,
      nextReview: this.nextReview,
      lastReview: this.lastReview,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  static fromJSON(json) {
    return new Card(json)
  }
}
