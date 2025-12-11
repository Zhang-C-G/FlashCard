/**
 * Card Routes
 */
const express = require('express')
const router = express.Router()
const CardController = require('../controllers/CardController')

// GET /api/cards - Get all cards
router.get('/', CardController.getAll)

// GET /api/cards/due - Get due cards (must be before /:id)
router.get('/due', CardController.getDue)

// GET /api/cards/:id - Get card by ID
router.get('/:id', CardController.getById)

// POST /api/cards - Create card
router.post('/', CardController.create)

// PUT /api/cards/:id - Update card
router.put('/:id', CardController.update)

// DELETE /api/cards/:id - Delete card
router.delete('/:id', CardController.delete)

module.exports = router
