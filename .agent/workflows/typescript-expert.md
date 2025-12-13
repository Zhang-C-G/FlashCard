---
description: 处理 TypeScript 类型错误或定义新类型时使用
---

# TypeScript 类型专家

## 使用场景
- 类型错误排查
- 定义新的数据类型
- 泛型和工具类型

## 执行步骤

// turbo-all

1. **类型定义位置**
   - 全局类型：`src/lib/types.ts`
   - 组件 props：组件文件内定义
   - API 响应：`src/lib/api/types.ts`

2. **命名规范**
   ```typescript
   // 接口用于对象形状
   interface User { ... }
   
   // 类型别名用于联合类型
   type Status = 'active' | 'inactive';
   
   // Props 后缀
   interface ButtonProps { ... }
   ```

3. **常见模式**
   ```typescript
   // 可选属性
   interface Props {
     required: string;
     optional?: number;
   }
   
   // 泛型组件
   interface ListProps<T> {
     items: T[];
     renderItem: (item: T) => React.ReactNode;
   }
   ```

4. **错误排查**
   ```bash
   # 检查类型错误
   npx tsc --noEmit
   ```

5. **实用工具类型**
   - `Partial<T>` - 所有属性可选
   - `Required<T>` - 所有属性必需
   - `Pick<T, K>` - 选择部分属性
   - `Omit<T, K>` - 排除部分属性
