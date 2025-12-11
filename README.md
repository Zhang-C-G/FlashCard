# 🎴 C-Carte - Flashcard App

Application de flashcards pour l'apprentissage par répétition espacée (algorithme SM-2).

## 🛠️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Front-end** | Vue.js 3 + Vite |
| **Back-end** | Express.js |
| **State** | Pinia |
| **Routing** | Vue Router |
| **HTTP** | Axios |

## 📁 Structure du projet

```
C_Carte/
├── src/                        # Front-end Vue.js
│   ├── api/                    # Communication HTTP
│   │   └── cardApi.js
│   ├── assets/                 # Static assets
│   │   └── styles/             # Global CSS
│   │       ├── variables.css   # Design tokens
│   │       ├── base.css        # Reset & base styles
│   │       ├── components.css  # Reusable components
│   │       └── index.css       # Main entry
│   ├── components/             # Composants réutilisables
│   │   ├── FlashCard.vue
│   │   └── AddCardForm.vue
│   ├── entities/               # Entités/Models
│   │   └── Card.js
│   ├── router/                 # Vue Router
│   │   └── index.js
│   ├── services/               # Logique métier
│   │   └── SM2Service.js
│   ├── stores/                 # Pinia (état global)
│   │   └── cardStore.js
│   ├── views/                  # Pages
│   │   ├── ReviewView.vue
│   │   ├── AddView.vue
│   │   └── ManageView.vue
│   ├── App.vue
│   └── main.js
│
├── server/                     # Back-end Express.js (Modular)
│   ├── config/                 # Configuration
│   │   └── index.js
│   ├── controllers/            # HTTP request handlers
│   │   ├── BookController.js
│   │   ├── CardController.js
│   │   └── index.js
│   ├── middleware/             # Express middleware
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── index.js
│   ├── repositories/           # Data access layer
│   │   ├── BookRepository.js
│   │   ├── CardRepository.js
│   │   └── index.js
│   ├── routes/                 # Route definitions
│   │   ├── bookRoutes.js
│   │   ├── cardRoutes.js
│   │   └── index.js
│   ├── services/               # Business logic
│   │   ├── BookService.js
│   │   ├── CardService.js
│   │   └── index.js
│   ├── data/                   # JSON data storage
│   └── index.js                # Entry point
│
├── .env.example                # Environment variables template
└── package.json
```

## 🏗️ Architecture

### Backend (Express.js)
```
Request → Routes → Controllers → Services → Repositories → Data
```

- **Routes**: Define API endpoints
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic
- **Repositories**: Data access layer

## 🚀 Démarrage

### Installation
```bash
npm install
cd server && npm install
```

### Développement
```bash
# Terminal 1 - Front-end (Vue.js)
npm run dev

# Terminal 2 - Back-end (Express)
npm run server
```

### URLs
| Service | URL |
|---------|-----|
| Front-end | http://localhost:5173 |
| API | http://localhost:3001 |

## 📚 API REST

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/cards` | Liste toutes les cartes |
| GET | `/api/cards/due` | Cartes à réviser |
| GET | `/api/cards/:id` | Une carte par ID |
| POST | `/api/cards` | Créer une carte |
| PUT | `/api/cards/:id` | Modifier une carte |
| DELETE | `/api/cards/:id` | Supprimer une carte |

## 🧠 Algorithme SM-2

L'application utilise l'algorithme SM-2 pour la répétition espacée :
- **Again** (0) : Carte oubliée, recommencer
- **Hard** (2) : Difficile
- **Good** (4) : Correct
- **Easy** (5) : Très facile
