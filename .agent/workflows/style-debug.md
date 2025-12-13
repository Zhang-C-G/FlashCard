---
description: 调试样式问题或修改 Tailwind 配置时使用
---

# 样式调试专家

## 使用场景
- 样式不生效
- 深色模式问题
- 响应式布局问题
- 自定义主题颜色

## 执行步骤

// turbo-all

1. **检查 globals.css**
   - 位置：`src/app/globals.css`
   - 确认 CSS 变量定义正确
   - 检查 `:root` 和 `.dark` 变量

2. **项目配色方案**
   - 使用 oklch 颜色空间
   - 主色：`--primary: oklch(0.5555 0 0)`
   - 零圆角：`--radius: 0rem`
   - 无阴影设计

3. **常见问题排查**
   ```bash
   # 重启开发服务器
   npm run dev
   
   # 清除 .next 缓存
   Remove-Item -Recurse -Force .next
   ```

4. **Tailwind v4 注意事项**
   - 使用 `@theme inline` 定义主题
   - 颜色变量：`--color-*` 映射到 `bg-*`
   - 深色模式：`@custom-variant dark`

5. **调试技巧**
   - 浏览器 DevTools 检查计算样式
   - 检查类名是否正确应用
   - 确认 CSS 变量值
