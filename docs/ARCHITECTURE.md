# 🏗️ C-Carte 架构指南

> **重要**: 本文档定义了项目的架构规范。所有代码修改必须遵循这些规则。

## 📐 核心架构原则

### 1. 分层架构 (Layered Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Vue.js)                   │
├─────────────────────────────────────────────────────────┤
│  Views → Components → Stores → Services → API           │
└─────────────────────────────────────────────────────────┘
                            ↓ HTTP
┌─────────────────────────────────────────────────────────┐
│                      Backend (Express)                   │
├─────────────────────────────────────────────────────────┤
│  Routes → Controllers → Services → Repositories → Data  │
└─────────────────────────────────────────────────────────┘
```

### 2. 单向数据流

```
用户操作 → View → Store Action → API → Backend → Response → Store State → View 更新
```

### 3. 关注点分离 (Separation of Concerns)

| 层级 | 职责 | 禁止 |
|------|------|------|
| **View/Component** | UI 渲染、用户交互 | ❌ 业务逻辑、直接 API 调用 |
| **Store** | 状态管理、数据缓存 | ❌ UI 逻辑、直接 DOM 操作 |
| **Service** | 业务逻辑、算法 | ❌ 状态管理、HTTP 调用 |
| **API** | HTTP 通信 | ❌ 业务逻辑、状态管理 |
| **Controller** | 请求/响应处理 | ❌ 业务逻辑、数据访问 |
| **Repository** | 数据访问 | ❌ 业务逻辑、HTTP 处理 |

---

## 📁 目录结构规范

### Frontend (`src/`)

```
src/
├── api/                 # HTTP 通信层
│   └── [resource]Api.js # 每个资源一个文件
├── assets/
│   └── styles/          # 全局样式
│       ├── variables.css
│       ├── base.css
│       └── components.css
├── components/          # 可复用 UI 组件
│   └── [Name].vue       # PascalCase 命名
├── entities/            # 数据实体/模型
│   └── [Name].js        # PascalCase 命名
├── router/              # 路由配置
├── services/            # 纯业务逻辑
│   └── [Name]Service.js
├── stores/              # Pinia 状态管理
│   └── [name]Store.js   # camelCase 命名
└── views/               # 页面组件
    └── [Name]View.vue   # 以 View 结尾
```

### Backend (`server/`)

```
server/
├── config/              # 配置
├── controllers/         # HTTP 处理器
│   └── [Name]Controller.js
├── middleware/          # Express 中间件
├── repositories/        # 数据访问
│   └── [Name]Repository.js
├── routes/              # 路由定义
│   └── [name]Routes.js
├── services/            # 业务逻辑
│   └── [Name]Service.js
└── data/                # 数据存储
```

---

## 🔴 严格禁止的模式

### ❌ 1. 在 Controller 中写业务逻辑

```javascript
// ❌ 错误 - Controller 包含业务逻辑
class CardController {
  create(req, res) {
    // 业务逻辑不应该在这里
    if (!req.body.front?.trim()) throw new Error('...')
    const tags = req.body.tagsInput.split(',').map(t => t.trim())
    // ...
  }
}

// ✅ 正确 - Controller 只做请求/响应处理
class CardController {
  create(req, res, next) {
    try {
      const card = CardService.create(req.body)  // 委托给 Service
      res.status(201).json(card)
    } catch (error) {
      next(error)
    }
  }
}
```

### ❌ 2. 在 Vue 组件中直接调用 API

```javascript
// ❌ 错误 - 组件直接调用 API
<script setup>
import axios from 'axios'

async function saveCard() {
  await axios.post('/api/cards', cardData)  // 不要这样做
}
</script>

// ✅ 正确 - 通过 Store 调用
<script setup>
import { useCardStore } from '@/stores/cardStore'

const cardStore = useCardStore()

async function saveCard() {
  await cardStore.addCard(cardData)  // Store 处理 API 调用
}
</script>
```

### ❌ 3. 在 Service 中访问 req/res

```javascript
// ❌ 错误 - Service 依赖 Express 对象
class CardService {
  create(req) {  // 不要传入 req
    const data = req.body
  }
}

// ✅ 正确 - Service 只接收纯数据
class CardService {
  create(data) {  // 接收纯数据对象
    // 业务逻辑
  }
}
```

### ❌ 4. 在 Repository 中写业务逻辑

```javascript
// ❌ 错误 - Repository 包含业务逻辑
class CardRepository {
  save(card) {
    // 验证不应该在这里
    if (!card.front) throw new Error('Front required')
    // ...
  }
}

// ✅ 正确 - Repository 只做数据操作
class CardRepository {
  save(card) {
    // 只做存储操作，不验证
    const cards = this.findAll()
    cards.push(card)
    fs.writeFileSync(FILE, JSON.stringify(cards))
    return card
  }
}
```

---

## ✅ 正确的代码模式

详见 `docs/PATTERNS.md`

---

## 📝 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| **文件 - 组件** | PascalCase.vue | `FlashCard.vue` |
| **文件 - Store** | camelCase.js | `cardStore.js` |
| **文件 - Service** | PascalCase.js | `SM2Service.js` |
| **类名** | PascalCase | `CardController` |
| **函数/方法** | camelCase | `getById()` |
| **常量** | UPPER_SNAKE | `API_URL` |
| **CSS 变量** | kebab-case | `--color-primary` |
| **CSS 类** | kebab-case | `.btn-primary` |
| **API 路由** | kebab-case | `/api/cards/due` |

---

## 🔄 修改代码检查清单

在修改代码前，请确认：

- [ ] 新代码放在正确的层级
- [ ] 没有违反分层原则
- [ ] 遵循命名规范
- [ ] 使用全局 CSS 变量而非硬编码颜色
- [ ] 错误通过 `next(error)` 传递给中间件
- [ ] 新增 API 端点在对应的 routes 文件中
