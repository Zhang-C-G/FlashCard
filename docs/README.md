# 📚 C-Carte 开发文档

欢迎！本目录包含项目的所有开发文档。

---

## 📖 文档索引

| 文档 | 描述 | 适用场景 |
|------|------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 架构指南 | 了解项目整体架构和分层原则 |
| [PATTERNS.md](./PATTERNS.md) | 代码模式参考 | 添加新功能时参考具体代码示例 |
| [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md) | AI 开发指令 | 使用 AI 助手时必读 |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | 快速参考卡 | 速查文件位置、CSS 变量、代码片段 |
| [CHANGELOG.md](./CHANGELOG.md) | 更新日志 | 查看项目变更历史 |

---

## 🎯 快速导航

### 我是新手，从哪开始？

1. 先读 [ARCHITECTURE.md](./ARCHITECTURE.md) 了解整体架构
2. 再读 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) 熟悉常用模式

### 我要添加新功能

1. 查看 [PATTERNS.md](./PATTERNS.md) 找到对应场景
2. 按照示例代码实现

### 我在使用 AI 助手

1. 将 [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md) 的内容提供给 AI
2. 或者在对话开始时说："请先阅读 docs/AI_INSTRUCTIONS.md"

---

## 🏗️ 架构概览

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

---

## ⚠️ 核心规则

1. **分层架构** - 每层只调用下一层
2. **单一职责** - 每个模块只做一件事
3. **CSS 变量** - 不硬编码样式值
4. **统一错误处理** - 使用 `next(error)`
5. **通过 Store 调用 API** - 组件不直接调用 axios

---

## 📝 贡献指南

修改代码前，请确保：

- [ ] 阅读了相关文档
- [ ] 代码放在正确的层级
- [ ] 遵循命名规范
- [ ] 使用全局 CSS 变量
- [ ] 更新 CHANGELOG.md（如有重大变更）
