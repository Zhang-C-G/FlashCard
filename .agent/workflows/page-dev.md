---
description: 创建新的 Next.js 页面或路由时使用
---

# 页面开发专家

## 使用场景
- 创建新页面
- 添加动态路由
- 配置页面 metadata

## 执行步骤

// turbo-all

1. **确定路由结构**
   - App Router 位置：`src/app/[route]/page.tsx`
   - 动态路由：`src/app/[param]/page.tsx`
   - 路由组：`src/app/(group)/page.tsx`

2. **页面模板**
   ```typescript
   // 服务端组件（默认）
   export default function PageName() {
     return (
       <div className="container mx-auto px-4 py-8">
         {/* 内容 */}
       </div>
     );
   }
   ```

3. **客户端页面**
   ```typescript
   "use client";
   import * as React from "react";
   
   export default function PageName() {
     // 使用 hooks
   }
   ```

4. **Metadata 配置**
   ```typescript
   export const metadata = {
     title: "页面标题 - FlashCard",
     description: "页面描述",
   };
   ```

5. **布局检查**
   - 确保响应式设计
   - 使用 container 居中
   - 适配 Header 高度
