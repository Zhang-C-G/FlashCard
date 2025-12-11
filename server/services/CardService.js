/**
 * Card Service - Business logic for cards
 */
const CardRepository = require('../repositories/CardRepository')

class CardService {
  getAll() {
    return CardRepository.findAll()
  }

  getById(id) {
    const card = CardRepository.findById(id)
    if (!card) {
      const error = new Error('Card not found')
      error.statusCode = 404
      throw error
    }
    return card
  }

  create(data) {
    // Validation
    if (!data.front?.trim()) {
      const error = new Error('Front is required')
      error.statusCode = 400
      throw error
    }
    if (!data.back?.trim()) {
      const error = new Error('Back is required')
      error.statusCode = 400
      throw error
    }
    
    // Parse tags
    const tags = data.tagsInput 
      ? data.tagsInput.split(',').map(t => t.trim()).filter(t => t)
      : data.tags || []
    
    const card = {
      front: data.front.trim(),
      back: data.back.trim(),
      hint: data.hint?.trim() || '',
      category: data.category || 'default',
      tags,
      favorite: false,
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      nextReview: null,
      lastReview: null
    }
    
    return CardRepository.save(card)
  }

  update(id, data) {
    const card = CardRepository.findById(id)
    if (!card) {
      const error = new Error('Card not found')
      error.statusCode = 404
      throw error
    }
    
    return CardRepository.save({ ...card, ...data })
  }

  delete(id) {
    const success = CardRepository.delete(id)
    if (!success) {
      const error = new Error('Card not found')
      error.statusCode = 404
      throw error
    }
    return true
  }

  getDue() {
    const cards = CardRepository.findAll()
    return cards.filter(card => {
      if (!card.nextReview) return true
      return new Date(card.nextReview) <= new Date()
    })
  }
}

module.exports = new CardService()
