/**
 * Card Controller - HTTP request handlers for cards
 */
const CardService = require('../services/CardService')

class CardController {
  // GET /api/cards
  getAll(req, res, next) {
    try {
      const cards = CardService.getAll()
      res.json(cards)
    } catch (error) {
      next(error)
    }
  }

  // GET /api/cards/due
  getDue(req, res, next) {
    try {
      const cards = CardService.getDue()
      res.json(cards)
    } catch (error) {
      next(error)
    }
  }

  // GET /api/cards/:id
  getById(req, res, next) {
    try {
      const card = CardService.getById(parseInt(req.params.id))
      res.json(card)
    } catch (error) {
      next(error)
    }
  }

  // POST /api/cards
  create(req, res, next) {
    try {
      const card = CardService.create(req.body)
      res.status(201).json(card)
    } catch (error) {
      next(error)
    }
  }

  // PUT /api/cards/:id
  update(req, res, next) {
    try {
      const card = CardService.update(parseInt(req.params.id), req.body)
      res.json(card)
    } catch (error) {
      next(error)
    }
  }

  // DELETE /api/cards/:id
  delete(req, res, next) {
    try {
      CardService.delete(parseInt(req.params.id))
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new CardController()
