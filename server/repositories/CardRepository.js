/**
 * Card Repository - Data access layer for user cards
 */
const fs = require('fs')
const config = require('../config')

class CardRepository {
  constructor() {
    this._ensureDataFile()
  }

  _ensureDataFile() {
    if (!fs.existsSync(config.DATA_DIR)) {
      fs.mkdirSync(config.DATA_DIR, { recursive: true })
    }
    if (!fs.existsSync(config.USER_CARDS_FILE)) {
      fs.writeFileSync(config.USER_CARDS_FILE, JSON.stringify([]))
    }
  }

  findAll() {
    const data = fs.readFileSync(config.USER_CARDS_FILE, 'utf8')
    return JSON.parse(data)
  }

  findById(id) {
    const cards = this.findAll()
    return cards.find(c => c.id === id) || null
  }

  save(card) {
    const cards = this.findAll()
    const index = cards.findIndex(c => c.id === card.id)
    
    if (index >= 0) {
      cards[index] = { ...cards[index], ...card, updatedAt: new Date().toISOString() }
    } else {
      card.id = card.id || Date.now()
      card.createdAt = new Date().toISOString()
      card.updatedAt = new Date().toISOString()
      cards.push(card)
    }
    
    fs.writeFileSync(config.USER_CARDS_FILE, JSON.stringify(cards, null, 2))
    return card
  }

  delete(id) {
    const cards = this.findAll()
    const index = cards.findIndex(c => c.id === id)
    
    if (index >= 0) {
      cards.splice(index, 1)
      fs.writeFileSync(config.USER_CARDS_FILE, JSON.stringify(cards, null, 2))
      return true
    }
    return false
  }
}

module.exports = new CardRepository()
