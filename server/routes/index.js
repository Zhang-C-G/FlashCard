/**
 * Routes Index
 */
const express = require('express')
const router = express.Router()

const cardRoutes = require('./cardRoutes')
const bookRoutes = require('./bookRoutes')

// Mount routes
router.use('/cards', cardRoutes)
router.use('/books', bookRoutes)

module.exports = router
