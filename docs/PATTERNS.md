# 📚 代码模式参考手册

> 本文档提供各种场景的正确代码模式，供开发时参考。

---

## 🎯 场景索引

1. [添加新的 API 端点](#1-添加新的-api-端点)
2. [添加新的 Vue 页面](#2-添加新的-vue-页面)
3. [添加新的可复用组件](#3-添加新的可复用组件)
4. [添加新的业务逻辑](#4-添加新的业务逻辑)
5. [添加新的数据实体](#5-添加新的数据实体)
6. [修改现有功能](#6-修改现有功能)
7. [添加全局样式](#7-添加全局样式)
8. [错误处理模式](#8-错误处理模式)

---

## 1. 添加新的 API 端点

### 场景：添加 `GET /api/cards/favorites` 获取收藏卡片

#### Step 1: Repository (数据访问)

```javascript
// server/repositories/CardRepository.js

class CardRepository {
  // ... 现有方法

  // 新增：查找收藏卡片
  findFavorites() {
    const cards = this.findAll()
    return cards.filter(c => c.favorite === true)
  }
}
```

#### Step 2: Service (业务逻辑)

```javascript
// server/services/CardService.js

class CardService {
  // ... 现有方法

  // 新增：获取收藏卡片（可添加业务规则）
  getFavorites() {
    const favorites = CardRepository.findFavorites()
    // 可以在这里添加排序、过滤等业务逻辑
    return favorites.sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    )
  }
}
```

#### Step 3: Controller (请求处理)

```javascript
// server/controllers/CardController.js

class CardController {
  // ... 现有方法

  // 新增：GET /api/cards/favorites
  getFavorites(req, res, next) {
    try {
      const cards = CardService.getFavorites()
      res.json(cards)
    } catch (error) {
      next(error)  // 统一错误处理
    }
  }
}
```

#### Step 4: Route (路由定义)

```javascript
// server/routes/cardRoutes.js

// 注意：特定路由要放在 /:id 之前
router.get('/favorites', CardController.getFavorites)
router.get('/:id', CardController.getById)
```

#### Step 5: Frontend API

```javascript
// src/api/cardApi.js

export const cardApi = {
  // ... 现有方法

  async getFavorites() {
    const response = await axios.get(`${API_URL}/cards/favorites`)
    return response.data
  }
}
```

#### Step 6: Store Action

```javascript
// src/stores/cardStore.js

async function fetchFavorites() {
  loading.value = true
  try {
    const data = await cardApi.getFavorites()
    return data.map(c => new Card(c))
  } catch (e) {
    error.value = e.message
    return []
  } finally {
    loading.value = false
  }
}
```

---

## 2. 添加新的 Vue 页面

### 场景：添加统计页面 `/stats`

#### Step 1: 创建 View 组件

```vue
<!-- src/views/StatsView.vue -->
<script setup>
import { computed, onMounted } from 'vue'
import { useCardStore } from '@/stores/cardStore'

const cardStore = useCardStore()

// 使用 computed 获取响应式数据
const stats = computed(() => cardStore.stats)

// 生命周期钩子
onMounted(() => {
  // 初始化逻辑
})
</script>

<template>
  <div class="stats-view">
    <header class="view-header">
      <h1>📊 统计</h1>
    </header>

    <main class="view-content">
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">总卡片</span>
        </div>
        <!-- 更多统计卡片 -->
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 使用全局 CSS 变量 */
.stats-view {
  min-height: 100vh;
  background: var(--color-bg);
}

.view-header {
  padding: var(--space-lg) var(--space-xl);
  background: var(--color-bg-white);
  box-shadow: var(--shadow-md);
}

.stat-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-primary);
}
</style>
```

#### Step 2: 添加路由

```javascript
// src/router/index.js
import StatsView from '@/views/StatsView.vue'

const routes = [
  // ... 现有路由
  {
    path: '/stats',
    name: 'stats',
    component: StatsView
  }
]
```

#### Step 3: 添加导航链接

```vue
<!-- src/App.vue -->
<div class="nav-links">
  <!-- 现有链接 -->
  <router-link to="/stats" class="nav-link">📊 统计</router-link>
</div>
```

---

## 3. 添加新的可复用组件

### 场景：创建 StatCard 统计卡片组件

#### 组件设计原则

1. **Props 定义清晰** - 使用 TypeScript 风格的 props 定义
2. **Emit 事件** - 通过事件与父组件通信
3. **Scoped 样式** - 使用 scoped 避免样式污染
4. **使用全局变量** - 颜色、间距使用 CSS 变量

```vue
<!-- src/components/StatCard.vue -->
<script setup>
// Props 定义
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  icon: {
    type: String,
    default: '📊'
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'primary', 'success', 'warning'].includes(v)
  }
})

// 事件定义
const emit = defineEmits(['click'])

function handleClick() {
  emit('click', props.title)
}
</script>

<template>
  <div 
    class="stat-card" 
    :class="`stat-card--${variant}`"
    @click="handleClick"
  >
    <span class="stat-icon">{{ icon }}</span>
    <span class="stat-value">{{ value }}</span>
    <span class="stat-title">{{ title }}</span>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-lg);
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-sm);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 700;
}

.stat-title {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* 变体样式 */
.stat-card--primary .stat-value {
  color: var(--color-primary);
}

.stat-card--success .stat-value {
  color: var(--color-success);
}

.stat-card--warning .stat-value {
  color: var(--color-warning);
}
</style>
```

#### 使用组件

```vue
<script setup>
import StatCard from '@/components/StatCard.vue'

function handleStatClick(title) {
  console.log('Clicked:', title)
}
</script>

<template>
  <StatCard 
    title="总卡片" 
    :value="100" 
    icon="📚"
    variant="primary"
    @click="handleStatClick"
  />
</template>
```

---

## 4. 添加新的业务逻辑

### 场景：添加学习进度计算服务

#### 创建 Service 类

```javascript
// src/services/ProgressService.js

/**
 * Progress Service - 学习进度计算
 * 
 * 职责：
 * - 计算学习进度百分比
 * - 计算连续学习天数
 * - 生成学习报告
 * 
 * 禁止：
 * - 直接操作 DOM
 * - 调用 API
 * - 管理状态
 */
export class ProgressService {
  /**
   * 计算掌握进度
   * @param {Array} cards - 卡片数组
   * @returns {Object} 进度信息
   */
  static calculateProgress(cards) {
    if (!cards.length) {
      return { percentage: 0, mastered: 0, total: 0 }
    }

    const mastered = cards.filter(c => c.interval >= 21).length
    const percentage = Math.round((mastered / cards.length) * 100)

    return {
      percentage,
      mastered,
      total: cards.length
    }
  }

  /**
   * 计算连续学习天数
   * @param {Array} cards - 卡片数组
   * @returns {number} 连续天数
   */
  static calculateStreak(cards) {
    const reviewDates = cards
      .filter(c => c.lastReview)
      .map(c => new Date(c.lastReview).toDateString())
    
    const uniqueDates = [...new Set(reviewDates)].sort().reverse()
    
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)
      
      if (uniqueDates[i] === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  /**
   * 生成学习报告
   * @param {Array} cards - 卡片数组
   * @returns {Object} 学习报告
   */
  static generateReport(cards) {
    return {
      progress: this.calculateProgress(cards),
      streak: this.calculateStreak(cards),
      todayReviewed: cards.filter(c => {
        if (!c.lastReview) return false
        return new Date(c.lastReview).toDateString() === new Date().toDateString()
      }).length,
      dueCount: cards.filter(c => {
        if (!c.nextReview) return true
        return new Date(c.nextReview) <= new Date()
      }).length
    }
  }
}
```

#### 在 Store 中使用

```javascript
// src/stores/cardStore.js
import { ProgressService } from '@/services/ProgressService'

// 在 store 中添加 computed
const learningReport = computed(() => 
  ProgressService.generateReport(cards.value)
)
```

---

## 5. 添加新的数据实体

### 场景：添加 Deck（卡组）实体

```javascript
// src/entities/Deck.js

/**
 * Deck Entity - 卡组实体
 * 
 * 职责：
 * - 定义数据结构
 * - 数据验证
 * - 序列化/反序列化
 * 
 * 禁止：
 * - API 调用
 * - DOM 操作
 * - 状态管理
 */
export class Deck {
  constructor(data = {}) {
    this.id = data.id || Date.now()
    this.name = data.name || ''
    this.description = data.description || ''
    this.cardIds = data.cardIds || []
    this.color = data.color || '#667eea'
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }

  /**
   * 验证实体数据
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = []
    
    if (!this.name?.trim()) {
      errors.push('名称是必填项')
    }
    
    if (this.name && this.name.length > 50) {
      errors.push('名称不能超过50个字符')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取卡片数量
   */
  get cardCount() {
    return this.cardIds.length
  }

  /**
   * 添加卡片
   * @param {number} cardId 
   */
  addCard(cardId) {
    if (!this.cardIds.includes(cardId)) {
      this.cardIds.push(cardId)
      this.updatedAt = new Date().toISOString()
    }
  }

  /**
   * 移除卡片
   * @param {number} cardId 
   */
  removeCard(cardId) {
    const index = this.cardIds.indexOf(cardId)
    if (index > -1) {
      this.cardIds.splice(index, 1)
      this.updatedAt = new Date().toISOString()
    }
  }

  /**
   * 序列化为 JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      cardIds: this.cardIds,
      color: this.color,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  /**
   * 从 JSON 创建实例
   */
  static fromJSON(json) {
    return new Deck(json)
  }
}
```

---

## 6. 修改现有功能

### 原则

1. **找到正确的层级** - 确定修改应该在哪一层
2. **最小化改动** - 只修改必要的部分
3. **保持接口稳定** - 尽量不改变现有接口

### 示例：修改卡片验证规则

#### ❌ 错误做法 - 在多处修改

```javascript
// 在 Controller 中添加验证
// 在 Store 中添加验证
// 在 Component 中添加验证
// → 导致逻辑分散，难以维护
```

#### ✅ 正确做法 - 在 Entity 中修改

```javascript
// src/entities/Card.js
validate() {
  const errors = []
  
  if (!this.front?.trim()) {
    errors.push('Le recto est requis')
  }
  
  // 新增：前面内容长度限制
  if (this.front && this.front.length > 500) {
    errors.push('Le recto ne peut pas dépasser 500 caractères')
  }
  
  if (!this.back?.trim()) {
    errors.push('Le verso est requis')
  }
  
  // 新增：后面内容长度限制
  if (this.back && this.back.length > 1000) {
    errors.push('Le verso ne peut pas dépasser 1000 caractères')
  }
  
  return { valid: errors.length === 0, errors }
}
```

---

## 7. 添加全局样式

### 添加新的 CSS 变量

```css
/* src/assets/styles/variables.css */

:root {
  /* 现有变量... */
  
  /* 新增：卡组颜色 */
  --color-deck-1: #667eea;
  --color-deck-2: #f093fb;
  --color-deck-3: #4facfe;
  --color-deck-4: #43e97b;
}
```

### 添加新的组件类

```css
/* src/assets/styles/components.css */

/* ==================== Progress Bar ==================== */
.progress-bar {
  height: 8px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--gradient-primary);
  transition: width var(--transition-normal);
}

.progress-bar--success .progress-bar__fill {
  background: var(--color-success);
}
```

### 使用规则

```vue
<!-- ✅ 正确 - 使用全局变量 -->
<style scoped>
.my-component {
  color: var(--color-primary);
  padding: var(--space-md);
}
</style>

<!-- ❌ 错误 - 硬编码值 -->
<style scoped>
.my-component {
  color: #667eea;
  padding: 16px;
}
</style>
```

---

## 8. 错误处理模式

### Backend 错误处理

```javascript
// 1. Service 层抛出带状态码的错误
class CardService {
  getById(id) {
    const card = CardRepository.findById(id)
    if (!card) {
      const error = new Error('Card not found')
      error.statusCode = 404  // 附加状态码
      throw error
    }
    return card
  }
}

// 2. Controller 使用 next() 传递错误
class CardController {
  getById(req, res, next) {
    try {
      const card = CardService.getById(req.params.id)
      res.json(card)
    } catch (error) {
      next(error)  // 传递给错误中间件
    }
  }
}

// 3. 错误中间件统一处理
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    error: err.message
  })
}
```

### Frontend 错误处理

```javascript
// Store 中处理错误
async function addCard(cardData) {
  try {
    const card = await cardApi.create(cardData)
    cards.value.push(new Card(card))
    return { success: true, card }
  } catch (e) {
    error.value = e.response?.data?.error || e.message
    return { success: false, error: error.value }
  }
}

// Component 中使用
async function handleSubmit() {
  const result = await cardStore.addCard(formData)
  if (result.success) {
    showSuccess('卡片已添加')
  } else {
    showError(result.error)
  }
}
```

---

## 📋 快速检查清单

添加新功能前，确认：

| 检查项 | 确认 |
|--------|------|
| 代码放在正确的层级？ | ☐ |
| 使用全局 CSS 变量？ | ☐ |
| 遵循命名规范？ | ☐ |
| 错误正确传递？ | ☐ |
| 没有跨层调用？ | ☐ |
| Entity 包含验证？ | ☐ |
