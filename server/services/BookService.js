/**
 * Book Service - Business logic for books
 */
const BookRepository = require('../repositories/BookRepository')

class BookService {
  getAll() {
    return BookRepository.getAll()
  }

  getById(id) {
    const book = BookRepository.getById(id)
    if (!book) {
      const error = new Error('Book not found')
      error.statusCode = 404
      throw error
    }
    return book
  }

  getCards(bookId) {
    return BookRepository.getCards(bookId)
  }

  getAllCards() {
    return BookRepository.getAllCards()
  }
}

module.exports = new BookService()
