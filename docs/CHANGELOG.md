# 📋 更新日志

记录项目的重要变更。

---

## [1.1.0] - 2024-12-09

### 🏗️ 架构重构

#### Backend 模块化
- **新增** `server/config/` - 配置管理
- **新增** `server/controllers/` - HTTP 请求处理器
  - `BookController.js`
  - `CardController.js`
- **新增** `server/middleware/` - Express 中间件
  - `errorHandler.js` - 统一错误处理
  - `notFound.js` - 404 处理
- **新增** `server/repositories/` - 数据访问层
  - `BookRepository.js`
  - `CardRepository.js`
- **新增** `server/routes/` - 路由定义
  - `bookRoutes.js`
  - `cardRoutes.js`
- **新增** `server/services/` - 业务逻辑层
  - `BookService.js`
  - `CardService.js`
- **重构** `server/index.js` - 从 314 行精简到 69 行

#### Frontend 优化
- **新增** `src/assets/styles/` - 全局样式系统
  - `variables.css` - CSS 变量（设计令牌）
  - `base.css` - 基础样式
  - `components.css` - 可复用组件样式
- **更新** `src/stores/cardStore.js` - 支持 API 和 localStorage 双模式
- **更新** `src/api/cardApi.js` - 使用环境变量配置 API URL

#### 配置
- **新增** `.env.example` - 环境变量模板
- **新增** `server/.env.example` - 后端环境变量模板
- **新增** `dotenv` 依赖

#### 文档
- **新增** `docs/ARCHITECTURE.md` - 架构指南
- **新增** `docs/PATTERNS.md` - 代码模式参考
- **新增** `docs/AI_INSTRUCTIONS.md` - AI 开发指令
- **更新** `README.md` - 更新项目结构说明

---

## [1.0.0] - 初始版本

### 功能
- 卡片 CRUD 操作
- SM-2 间隔重复算法
- 卡片复习界面
- 卡片管理界面
- 书籍/卡组管理

### 技术栈
- Vue.js 3 + Vite
- Pinia 状态管理
- Vue Router
- Express.js API
- Axios HTTP 客户端
