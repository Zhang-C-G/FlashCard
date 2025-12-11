/**
 * Book Controller - HTTP request handlers for books
 */
const BookService = require('../services/BookService')

class BookController {
  // GET /api/books
  getAll(req, res, next) {
    try {
      const books = BookService.getAll()
      res.json(books)
    } catch (error) {
      next(error)
    }
  }

  // GET /api/books/:id
  getById(req, res, next) {
    try {
      const book = BookService.getById(req.params.id)
      res.json(book)
    } catch (error) {
      next(error)
    }
  }

  // GET /api/books/:id/cards
  getCards(req, res, next) {
    try {
      const cards = BookService.getCards(req.params.id)
      res.json(cards)
    } catch (error) {
      next(error)
    }
  }

  // GET /api/books/all/cards
  getAllCards(req, res, next) {
    try {
      const cards = BookService.getAllCards()
      res.json(cards)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new BookController()
