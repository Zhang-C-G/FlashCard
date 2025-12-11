# ⚡ 快速参考卡

> 一页纸速查表，快速找到正确的代码位置和模式。

---

## 📁 我要改什么？→ 去哪个文件？

| 我想... | 前端文件 | 后端文件 |
|---------|----------|----------|
| 添加新页面 | `src/views/XxxView.vue` | - |
| 添加 UI 组件 | `src/components/Xxx.vue` | - |
| 添加 API 端点 | `src/api/xxxApi.js` | `server/routes/xxxRoutes.js` |
| 添加业务逻辑 | `src/services/XxxService.js` | `server/services/XxxService.js` |
| 添加状态管理 | `src/stores/xxxStore.js` | - |
| 添加数据模型 | `src/entities/Xxx.js` | - |
| 添加数据访问 | - | `server/repositories/XxxRepository.js` |
| 添加请求处理 | - | `server/controllers/XxxController.js` |
| 添加全局样式 | `src/assets/styles/` | - |
| 添加路由 | `src/router/index.js` | `server/routes/index.js` |
| 添加中间件 | - | `server/middleware/` |
| 修改配置 | `.env` | `server/config/index.js` |

---

## 🎨 CSS 变量速查

### 颜色
```css
--color-primary       /* 主色 #667eea */
--color-success       /* 成功 #27ae60 */
--color-danger        /* 危险 #e74c3c */
--color-warning       /* 警告 #f39c12 */
--color-info          /* 信息 #3498db */
--color-text          /* 文字 #333 */
--color-text-muted    /* 次要文字 #666 */
--color-bg            /* 背景 #f5f7fa */
--color-bg-white      /* 白色背景 */
--color-border        /* 边框 #e0e0e0 */
--gradient-primary    /* 主色渐变 */
--gradient-success    /* 成功渐变 */
```

### 间距
```css
--space-xs   /* 0.25rem = 4px */
--space-sm   /* 0.5rem = 8px */
--space-md   /* 1rem = 16px */
--space-lg   /* 1.5rem = 24px */
--space-xl   /* 2rem = 32px */
--space-2xl  /* 3rem = 48px */
```

### 圆角
```css
--radius-sm   /* 4px */
--radius-md   /* 8px */
--radius-lg   /* 12px */
--radius-xl   /* 16px */
--radius-full /* 20px */
```

### 阴影
```css
--shadow-sm   /* 轻微阴影 */
--shadow-md   /* 中等阴影 */
--shadow-lg   /* 大阴影 */
--shadow-xl   /* 超大阴影 */
```

### 字体大小
```css
--text-xs    /* 0.75rem */
--text-sm    /* 0.875rem */
--text-base  /* 1rem */
--text-lg    /* 1.125rem */
--text-xl    /* 1.25rem */
--text-2xl   /* 1.5rem */
--text-3xl   /* 1.875rem */
```

---

## 🔧 代码片段

### Vue 组件

```vue
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true }
})

const emit = defineEmits(['click'])
</script>

<template>
  <div class="my-component">
    {{ title }}
  </div>
</template>

<style scoped>
.my-component {
  padding: var(--space-md);
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
}
</style>
```

### Store Action

```javascript
async function fetchData() {
  loading.value = true
  error.value = null
  try {
    const data = await api.getData()
    items.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
```

### Controller 方法

```javascript
methodName(req, res, next) {
  try {
    const result = Service.method(req.body)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
```

### Service 方法

```javascript
methodName(data) {
  if (!data.field) {
    const error = new Error('Field required')
    error.statusCode = 400
    throw error
  }
  return Repository.save(data)
}
```

---

## ✅ 检查清单

### 添加新功能前

- [ ] 确定代码应该放在哪一层
- [ ] 查看现有类似功能的实现方式
- [ ] 准备好使用全局 CSS 变量

### 提交代码前

- [ ] 没有跨层调用
- [ ] 使用了正确的命名规范
- [ ] 错误通过 next() 传递
- [ ] 没有硬编码的样式值
- [ ] 业务逻辑在 Service 层

---

## 🚫 常见错误

| 错误 | 正确做法 |
|------|----------|
| 组件直接调用 axios | 通过 Store 调用 |
| Controller 写业务逻辑 | 委托给 Service |
| 硬编码颜色值 | 使用 CSS 变量 |
| Repository 验证数据 | 在 Service/Entity 验证 |
| 每个路由单独 try-catch | 使用 next(error) |

---

## 📞 API 端点

### Cards
```
GET    /api/cards          获取所有卡片
GET    /api/cards/due      获取待复习卡片
GET    /api/cards/:id      获取单个卡片
POST   /api/cards          创建卡片
PUT    /api/cards/:id      更新卡片
DELETE /api/cards/:id      删除卡片
```

### Books
```
GET    /api/books              获取所有书籍
GET    /api/books/:id          获取书籍详情
GET    /api/books/:id/cards    获取书籍卡片
GET    /api/books/all/cards    获取所有书籍卡片
```
