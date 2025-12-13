---
description: 部署应用到生产环境或配置构建时使用
---

# 部署专家

## 使用场景
- 生产构建
- Vercel 部署
- Docker 容器化
- 环境变量配置

## 执行步骤

// turbo-all

1. **生产构建**
   ```bash
   # 构建检查
   npm run build
   
   # 本地预览生产版本
   npm run start
   ```

2. **环境变量**
   - `.env.local` - 本地开发
   - `.env.production` - 生产环境
   ```
   DATABASE_URL=file:./flashcard.db
   NEXT_PUBLIC_APP_URL=https://example.com
   ```

3. **Vercel 部署**
   ```bash
   # 安装 Vercel CLI
   npm i -g vercel
   
   # 部署
   vercel
   ```

4. **构建优化**
   ```javascript
   // next.config.ts
   const config = {
     output: 'standalone', // 独立输出
     images: {
       unoptimized: true, // 静态导出时
     },
   };
   ```

5. **静态导出（可选）**
   ```javascript
   // next.config.ts
   const config = {
     output: 'export',
   };
   ```
   ```bash
   npm run build
   # 输出到 out/ 目录
   ```

6. **部署检查清单**
   - [ ] 环境变量配置正确
   - [ ] 构建无错误
   - [ ] 数据库连接测试
   - [ ] API 端点可访问
   - [ ] 静态资源加载正常
