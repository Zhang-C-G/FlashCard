# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

C-Carte is a **flashcard application** for spaced repetition learning using the SM-2 algorithm. It's built with Vue.js 3 frontend and Express.js backend following a strict layered architecture.

## Development Commands

### Setup
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

### Development
```bash
# Start frontend only (Vue.js with Vite on port 5173)
npm run dev

# Start backend only (Express on port 3001)
npm run server

# Start both frontend and backend concurrently
npm start
```

### Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Strict Layered Architecture
The project enforces a strict separation of concerns:

**Frontend Flow:**
```
Views ’ Components ’ Stores ’ Services ’ API
```

**Backend Flow:**
```
Routes ’ Controllers ’ Services ’ Repositories ’ Data
```

### Key Rules
1. **No cross-layer calls** - Each layer can only call the layer directly below it
2. **Single responsibility** - Each module has one clear purpose
3. **Dependency injection** - Services are injected, not created by consumers
4. **Error propagation** - Backend errors use `next(error)` to reach middleware

### Directory Structure

**Frontend (`src/`)**
- `api/` - HTTP communication layer
- `components/` - Reusable Vue components (PascalCase.vue)
- `views/` - Page components (NameView.vue)
- `stores/` - Pinia state management (camelCaseStore.js)
- `services/` - Pure business logic (PascalCaseService.js)
- `entities/` - Data models (PascalCase.js)
- `router/` - Vue Router configuration
- `assets/styles/` - Global CSS with design tokens

**Backend (`server/`)**
- `routes/` - API route definitions (camelCaseRoutes.js)
- `controllers/` - HTTP request handlers (NameController.js)
- `services/` - Business logic (NameService.js)
- `repositories/` - Data access layer (NameRepository.js)
- `middleware/` - Express middleware
- `config/` - Configuration files
- `data/` - JSON file storage

## Code Patterns

### Adding New API Endpoints
1. Add data access method in `server/repositories/`
2. Add business logic in `server/services/`
3. Add request handler in `server/controllers/`
4. Define route in `server/routes/`
5. Add API call in `src/api/`
6. Add Store action in `src/stores/`

### Adding New Pages
1. Create view component in `src/views/NameView.vue`
2. Add route in `src/router/index.js`
3. Add navigation link in `src/App.vue` if needed

### Error Handling
**Backend:**
```javascript
// Service layer
const error = new Error('Message')
error.statusCode = 400
throw error

// Controller layer
try {
  // logic
} catch (error) {
  next(error)  // Pass to error middleware
}
```

**Frontend:**
```javascript
// Store actions
try {
  const result = await api.method(data)
  // update state
} catch (e) {
  error.value = e.response?.data?.error || e.message
}
```

### CSS Usage
Always use global CSS variables defined in `src/assets/styles/variables.css`:
```css
/*  Correct */
.element {
  color: var(--color-primary);
  padding: var(--space-md);
}

/* L Wrong */
.element {
  color: #667eea;
  padding: 16px;
}
```

## SM-2 Algorithm

The application implements the SM-2 spaced repetition algorithm:
- **Again (0)**: Card forgotten, restart
- **Hard (2)**: Difficult but remembered
- **Good (4)**: Correct with normal effort
- **Easy (5)**: Very easy to recall

Core implementation in `src/services/SM2Service.js:11`

## Key API Endpoints

- `GET /api/cards` - List all cards
- `GET /api/cards/due` - Get cards due for review
- `GET /api/cards/:id` - Get specific card
- `POST /api/cards` - Create new card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `GET /api/books` - List all books
- `GET /api/books/:id/cards` - Get cards from a book

## Testing

No testing framework is currently implemented. The project does not contain test files.

## Data Storage

The backend uses JSON files for persistence:
- `server/data/user-cards.json` - Main card storage
- `server/data/books/` - Book-specific data storage

## Important Notes

1. **Never hardcode styles** - Always use CSS variables from `variables.css`
2. **Follow naming conventions** - Files use specific patterns (PascalCase, camelCase)
3. **Business logic stays in services** - Don't put business logic in controllers or components
4. **Components communicate via stores** - Never call APIs directly from Vue components
5. **Use proper error handling** - Backend: `next(error)`, Frontend: try/catch in stores