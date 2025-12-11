/**
 * Server Configuration
 */
const path = require('path')

module.exports = {
  PORT: process.env.PORT || 3001,
  DATA_DIR: path.join(__dirname, '..', 'data'),
  BOOKS_DIR: path.join(__dirname, '..', 'data', 'books'),
  USER_CARDS_FILE: path.join(__dirname, '..', 'data', 'user-cards.json'),
  
  // CORS options
  CORS_OPTIONS: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
}
