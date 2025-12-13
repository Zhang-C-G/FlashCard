---
description: 创建新的 React/shadcn 组件时使用
---

# 组件开发专家

## 使用场景
- 创建新的 UI 组件
- 封装可复用逻辑
- 集成 shadcn/ui 组件

## 执行步骤

// turbo-all

1. **分析需求**
   - 确定组件用途和 props 接口
   - 检查是否有可复用的 shadcn/ui 组件

2. **创建组件文件**
   - 位置：`src/components/[category]/[name].tsx`
   - 使用 `"use client"` 如果需要交互
   - 导出命名组件（非默认导出）

3. **类型定义**
   ```typescript
   interface ComponentProps {
     // 必需的 props
     className?: string; // 始终支持自定义样式
   }
   ```

4. **样式规范**
   - 使用 `cn()` 合并类名
   - 优先使用 CSS 变量：`bg-background`, `text-foreground`
   - 遵循零圆角设计（项目风格）

5. **测试组件**
   - 在页面中引入测试
   - 验证响应式行为
   - 检查深色模式兼容性
