/**
 * Express.js Server - API REST pour Flashcard App
 * 
 * Architecture modulaire :
 * - Routes → Controllers → Services → Repositories
 * 
 * Structure:
 * ├── config/         - Configuration
 * ├── controllers/    - HTTP request handlers
 * ├── middleware/     - Express middleware
 * ├── repositories/   - Data access layer
 * ├── routes/         - Route definitions
 * └── services/       - Business logic
 */

// Load environment variables first
require('dotenv').config()

const express = require('express')
const cors = require('cors')

// Config
const config = require('./config')

// Routes
const routes = require('./routes')

// Middleware
const { errorHandler, notFound } = require('./middleware')

// Services (for startup stats)
const { BookService } = require('./services')

// ==================== App Setup ====================
const app = express()

// Global Middleware
app.use(cors(config.CORS_OPTIONS))
app.use(express.json())

// Request logging (development)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`)
  next()
})

// ==================== Routes ====================
app.use('/api', routes)

// ==================== Error Handling ====================
app.use(notFound)
app.use(errorHandler)

// ==================== Start Server ====================
app.listen(config.PORT, () => {
  const books = BookService.getAll()
  const totalCards = BookService.getAllCards().length
  
  console.log(`
🚀 Flashcard API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: http://localhost:${config.PORT}

📚 Books API:
   GET /api/books              - 获取所有书籍
   GET /api/books/:id          - 获取书籍详情
   GET /api/books/:id/cards    - 获取书籍卡片
   GET /api/books/all/cards    - 获取所有书籍卡片

🃏 Cards API:
   GET    /api/cards           - 获取用户卡片
   GET    /api/cards/due       - 获取待复习卡片
   POST   /api/cards           - 创建卡片
   PUT    /api/cards/:id       - 更新卡片
   DELETE /api/cards/:id       - 删除卡片

📊 Statistics:
   Books: ${books.length}
   Cards: ${totalCards}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
})
