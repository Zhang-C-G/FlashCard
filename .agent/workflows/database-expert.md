---
description: 集成 SQLite 数据库或处理数据持久化时使用
---

# 数据库专家

## 使用场景
- 设置 SQLite 数据库
- 定义数据模型
- CRUD 操作
- 数据迁移

## 执行步骤

// turbo-all

1. **安装依赖**
   ```bash
   npm install better-sqlite3
   npm install -D @types/better-sqlite3
   ```

2. **数据库初始化**
   - 位置：`src/lib/db/index.ts`
   ```typescript
   import Database from 'better-sqlite3';
   
   const db = new Database('flashcard.db');
   db.pragma('journal_mode = WAL');
   
   export default db;
   ```

3. **表结构设计**
   ```sql
   -- 卡组表
   CREATE TABLE decks (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   
   -- 闪卡表
   CREATE TABLE flashcards (
     id TEXT PRIMARY KEY,
     deck_id TEXT REFERENCES decks(id),
     front TEXT NOT NULL,
     back TEXT NOT NULL,
     difficulty TEXT DEFAULT 'medium',
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **数据访问层**
   - 位置：`src/lib/db/queries.ts`
   - 使用预编译语句
   - 封装为函数

5. **Server Actions（推荐）**
   ```typescript
   "use server";
   
   export async function createDeck(name: string) {
     // 数据库操作
   }
   ```
