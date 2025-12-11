/**
 * Book Repository - Data access layer for books
 */
const fs = require('fs')
const path = require('path')
const config = require('../config')

class BookRepository {
  getIndex() {
    const indexPath = path.join(config.BOOKS_DIR, 'index.json')
    if (!fs.existsSync(indexPath)) return { books: [] }
    return JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  }

  getAll() {
    return this.getIndex().books
  }

  getById(bookId) {
    const bookFile = path.join(config.BOOKS_DIR, `${bookId}.json`)
    if (!fs.existsSync(bookFile)) return null
    return JSON.parse(fs.readFileSync(bookFile, 'utf8'))
  }

  getCards(bookId) {
    const book = this.getById(bookId)
    if (!book) return []
    return book.cards.map(card => ({
      ...card,
      bookId: bookId,
      category: book.name
    }))
  }

  getAllCards() {
    const books = this.getAll()
    let allCards = []
    books.forEach(book => {
      const cards = this.getCards(book.id)
      allCards = allCards.concat(cards)
    })
    return allCards
  }
}

module.exports = new BookRepository()
