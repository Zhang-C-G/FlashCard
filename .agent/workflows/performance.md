---
description: 优化页面加载速度和运行性能时使用
---

# 性能优化专家

## 使用场景
- 页面加载慢
- 组件渲染卡顿
- 包体积过大
- 内存泄漏

## 执行步骤

// turbo-all

1. **分析构建产物**
   ```bash
   # 分析包大小
   npm run build
   npx @next/bundle-analyzer
   ```

2. **代码分割**
   ```typescript
   // 动态导入
   import dynamic from 'next/dynamic';
   
   const HeavyComponent = dynamic(
     () => import('@/components/HeavyComponent'),
     { loading: () => <p>加载中...</p> }
   );
   ```

3. **图片优化**
   ```typescript
   import Image from 'next/image';
   
   <Image
     src="/image.jpg"
     alt="描述"
     width={800}
     height={600}
     priority // 首屏图片
   />
   ```

4. **React 优化**
   ```typescript
   // 避免不必要的渲染
   const MemoComponent = React.memo(Component);
   
   // 缓存计算
   const value = React.useMemo(() => compute(), [deps]);
   
   // 缓存回调
   const handler = React.useCallback(() => {}, [deps]);
   ```

5. **字体优化**
   - 使用 `next/font` 自动优化
   - 预加载关键字体
   - 限制字体变体数量

6. **性能检测**
   - Lighthouse 审计
   - React DevTools Profiler
   - Web Vitals 监控
