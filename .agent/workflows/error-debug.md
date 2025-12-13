---
description: 遇到构建错误或运行时错误时使用
---

# 错误排查专家

## 使用场景
- 构建失败
- 运行时错误
- Hydration 错误
- 模块导入问题

## 执行步骤

// turbo-all

1. **查看错误信息**
   - 终端输出
   - 浏览器控制台
   - Next.js 错误覆盖层

2. **常见错误类型**

   **Hydration 错误**
   ```
   Error: Hydration failed because...
   ```
   解决：确保服务端和客户端渲染一致，检查日期/随机数

   **模块未找到**
   ```
   Module not found: Can't resolve...
   ```
   解决：检查导入路径、安装依赖

   **类型错误**
   ```
   Type 'X' is not assignable to type 'Y'
   ```
   解决：运行 `npx tsc --noEmit` 定位问题

3. **调试命令**
   ```bash
   # 清除缓存重启
   Remove-Item -Recurse -Force .next
   npm run dev
   
   # 检查依赖
   npm ls
   
   # 重新安装
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

4. **Next.js 特定问题**
   - "use client" 缺失 → 使用 hooks 的组件需要
   - 服务端组件限制 → 不能使用 useState 等
   - 动态导入 → `next/dynamic` 或 React.lazy

5. **报告问题**
   - 提供完整错误堆栈
   - 说明复现步骤
   - 列出最近的代码更改
