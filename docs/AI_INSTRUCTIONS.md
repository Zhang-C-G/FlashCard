# 🤖 AI 开发指令

> **重要**: 本文档是给 AI 助手（如 Claude、GPT）的指令。在修改此项目代码时，必须遵循以下规则。

---

## 📌 项目概述

- **项目名称**: C-Carte (Flashcard App)
- **前端**: Vue.js 3 + Vite + Pinia
- **后端**: Express.js (模块化架构)
- **架构**: 分层架构 (Layered Architecture)

---

## 🚨 必须遵守的规则

### 规则 1: 分层架构

```
Frontend: Views → Components → Stores → Services → API
Backend:  Routes → Controllers → Services → Repositories → Data
```

**每一层只能调用下一层，禁止跨层调用。**

### 规则 2: 文件位置

| 代码类型 | 前端位置 | 后端位置 |
|----------|----------|----------|
| HTTP 通信 | `src/api/` | - |
| UI 组件 | `src/components/` | - |
| 页面 | `src/views/` | - |
| 状态管理 | `src/stores/` | - |
| 业务逻辑 | `src/services/` | `server/services/` |
| 数据实体 | `src/entities/` | - |
| 路由定义 | `src/router/` | `server/routes/` |
| 请求处理 | - | `server/controllers/` |
| 数据访问 | - | `server/repositories/` |
| 中间件 | - | `server/middleware/` |
| 配置 | `.env` | `server/config/` |

### 规则 3: 命名规范

```
组件文件:     PascalCase.vue      (FlashCard.vue)
Store 文件:   camelCaseStore.js   (cardStore.js)
Service 文件: PascalCaseService.js (SM2Service.js)
路由文件:     camelCaseRoutes.js  (cardRoutes.js)
CSS 类:       kebab-case          (.btn-primary)
CSS 变量:     --kebab-case        (--color-primary)
```

### 规则 4: CSS 使用全局变量

```css
/* ✅ 正确 */
.element {
  color: var(--color-primary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}

/* ❌ 错误 */
.element {
  color: #667eea;
  padding: 16px;
  border-radius: 8px;
}
```

### 规则 5: 错误处理

```javascript
// Backend: 使用 next(error)
controller(req, res, next) {
  try {
    // ...
  } catch (error) {
    next(error)  // ✅ 传递给错误中间件
  }
}

// 不要这样做:
catch (error) {
  res.status(500).json({ error })  // ❌
}
```

---

## 📝 添加新功能的步骤

### 添加新 API 端点

1. `server/repositories/` - 添加数据访问方法
2. `server/services/` - 添加业务逻辑
3. `server/controllers/` - 添加请求处理器
4. `server/routes/` - 添加路由定义
5. `src/api/` - 添加前端 API 调用
6. `src/stores/` - 添加 Store action

### 添加新页面

1. `src/views/` - 创建 XxxView.vue
2. `src/router/index.js` - 添加路由
3. `src/App.vue` - 添加导航链接（如需要）

### 添加新组件

1. `src/components/` - 创建 Xxx.vue
2. 使用 `defineProps` 和 `defineEmits`
3. 使用 `<style scoped>` 和全局 CSS 变量

---

## ⛔ 禁止的模式

### 1. Controller 中写业务逻辑

```javascript
// ❌ 禁止
class Controller {
  create(req, res) {
    if (!req.body.name) throw new Error('...')  // 业务逻辑
    const result = data.filter(...)  // 业务逻辑
  }
}

// ✅ 正确
class Controller {
  create(req, res, next) {
    try {
      const result = Service.create(req.body)  // 委托给 Service
      res.json(result)
    } catch (e) { next(e) }
  }
}
```

### 2. 组件直接调用 API

```javascript
// ❌ 禁止
<script setup>
import axios from 'axios'
await axios.post('/api/cards', data)
</script>

// ✅ 正确
<script setup>
import { useCardStore } from '@/stores/cardStore'
const store = useCardStore()
await store.addCard(data)
</script>
```

### 3. Service 依赖 HTTP 对象

```javascript
// ❌ 禁止
class Service {
  create(req) {  // 不要传入 req
    const data = req.body
  }
}

// ✅ 正确
class Service {
  create(data) {  // 传入纯数据
    // ...
  }
}
```

### 4. 硬编码样式值

```css
/* ❌ 禁止 */
.btn { background: #667eea; }

/* ✅ 正确 */
.btn { background: var(--color-primary); }
```

### 5. 在 Repository 中验证数据

```javascript
// ❌ 禁止 - Repository 只做数据操作
class Repository {
  save(data) {
    if (!data.name) throw new Error('...')  // 不要验证
  }
}

// ✅ 正确 - 验证在 Service 或 Entity 中
class Service {
  create(data) {
    const entity = new Entity(data)
    const validation = entity.validate()
    if (!validation.valid) throw new Error(...)
    return Repository.save(entity)
  }
}
```

---

## 📂 关键文件参考

修改代码前，请先阅读这些文件了解现有模式：

| 文件 | 用途 |
|------|------|
| `src/stores/cardStore.js` | Store 模式参考 |
| `src/entities/Card.js` | Entity 模式参考 |
| `src/components/FlashCard.vue` | 组件模式参考 |
| `server/controllers/CardController.js` | Controller 模式参考 |
| `server/services/CardService.js` | Service 模式参考 |
| `server/repositories/CardRepository.js` | Repository 模式参考 |
| `src/assets/styles/variables.css` | CSS 变量定义 |

---

## ✅ 代码审查清单

在生成代码后，检查：

- [ ] 代码放在正确的目录？
- [ ] 遵循命名规范？
- [ ] 使用全局 CSS 变量？
- [ ] 没有跨层调用？
- [ ] 错误使用 next() 传递？
- [ ] 业务逻辑在 Service 层？
- [ ] 数据验证在 Entity 或 Service？
- [ ] 组件通过 Store 调用 API？

---

## 🔧 常用代码模板

### Vue 组件模板

```vue
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // props
})

const emit = defineEmits(['event'])
</script>

<template>
  <div class="component-name">
    <!-- content -->
  </div>
</template>

<style scoped>
.component-name {
  /* 使用 CSS 变量 */
}
</style>
```

### Controller 方法模板

```javascript
methodName(req, res, next) {
  try {
    const result = Service.method(req.body)
    res.json(result)
  } catch (error) {
    next(error)
  }
}
```

### Service 方法模板

```javascript
methodName(data) {
  // 验证
  if (!data.field) {
    const error = new Error('Field required')
    error.statusCode = 400
    throw error
  }
  
  // 业务逻辑
  return Repository.save(data)
}
```

### Store Action 模板

```javascript
async function actionName(data) {
  loading.value = true
  error.value = null
  try {
    const result = await api.method(data)
    // 更新状态
    return result
  } catch (e) {
    error.value = e.message
    throw e
  } finally {
    loading.value = false
  }
}
```
