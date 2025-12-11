/**
 * Book Routes
 */
const express = require('express')
const router = express.Router()
const BookController = require('../controllers/BookController')

// GET /api/books - Get all books
router.get('/', BookController.getAll)

// GET /api/books/all/cards - Get all cards from all books (must be before /:id)
router.get('/all/cards', BookController.getAllCards)

// GET /api/books/:id - Get book by ID
router.get('/:id', BookController.getById)

// GET /api/books/:id/cards - Get cards from a book
router.get('/:id/cards', BookController.getCards)

module.exports = router
