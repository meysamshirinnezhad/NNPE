# TypeScript Build Errors - Quick Fix Guide

## 🚨 Critical Issues Blocking Build

### 1. **Missing Node Types** (High Priority)
```bash
# Install missing @types/node package
cd front && npm install --save-dev @types/node
```

### 2. **Button Component Variant Issues** (High Priority)

The `Button` component doesn't support the "outline" variant. Fix these files:

#### `front/src/pages/topics/detail/page.tsx`
```typescript
// CHANGE: Remove "outline" variants or use "secondary"
- variant="outline"
+ variant="secondary"
```

Lines to fix: 177, 194, 369, 378, 387

### 3. **CircularProgress Component Props** (High Priority)

#### `front/src/pages/topics/detail/page.tsx`
```typescript
// REMOVE: className prop from CircularProgress component
- className={getMasteryColor(topic.mastery)}
// Add className to wrapper div instead
```

### 4. **Unused Variables** (Medium Priority - Can use underscore prefix)

#### `front/src/pages/profile/page.tsx`
```typescript
// REMOVE unused imports
- import { userService, testService } from '../../api';
+ import { userService } from '../../api';

- import type { TestHistoryItem } from '../../api/services/test.service';

// REMOVE unused navigate
- const navigate = useNavigate();
```

#### `front/src/components/test-history/TestHistory.tsx`
```typescript
// REMOVE: test_key parameter (doesn't exist in type)
listHistory({
  topic_id: topicId,
  // test_key: testKey, // ← REMOVE THIS LINE
  status: statusFilter,
  page: currentPage,
  page_size: pageSize,
})
```

### 5. **SEO Data Missing Properties** (Medium Priority)

These properties don't exist in your `seoData` type. Either:
- Add them to your SEO data types
- Or comment out the references temporarily

#### `front/src/pages/achievements/page.tsx`
```typescript
// TEMPORARY FIX: Comment out until SEO data is defined
- updateSEO(seoData.achievements);
// + updateSEO({ title: 'Achievements', description: 'Your achievements' });
```

Similar fixes needed for:
- `blog` property
- `contact` property  
- `forum` property
- `help` property
- `privacyPolicy` property
- `termsOfService` property

### 6. **TypeScript Config Issues** (Medium Priority)

#### `tsconfig.app.json` and `tsconfig.node.json`
```json
// REMOVE: This compiler option (not supported in your TypeScript version)
{
  "compilerOptions": {
    // "erasableSyntaxOnly": true, // ← REMOVE THIS LINE
    // ... rest of options
  }
}
```

### 7. **Vite Config Node.js Issues** (Medium Priority)

#### `front/src/vite.config.ts`
```typescript
// FIX: Add proper Node.js type definitions
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Add Node.js global types
declare const __dirname: string;
declare const process: {
  env: {
    NODE_ENV: string;
    BASE_PATH?: string;
    IS_PREVIEW?: string;
  };
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  // ... rest of config
})
```

## 🛠️ Quick Build Fix Commands

```bash
# 1. Install missing types
cd front && npm install --save-dev @types/node

# 2. Fix the major issues by editing these files:
# - front/src/pages/topics/detail/page.tsx (remove "outline" variants)
# - front/src/pages/profile/page.tsx (remove unused imports)
# - front/src/components/test-history/TestHistory.tsx (remove test_key)

# 3. Rebuild
npm run build
```

## 📝 Temporary Workaround

If you need to get the build working immediately, you can temporarily disable strict TypeScript checking:

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "noUnusedLocals": false,    // ← Disable unused variables check
    "noUnusedParameters": false, // ← Disable unused parameters check
    // ... other options
  }
}
```

## 🎯 Priority Order

1. **Install @types/node** - Fixes configuration errors
2. **Fix Button variants** - Fixes component prop errors
3. **Remove unused imports** - Fixes profile page errors
4. **Fix SEO data calls** - Prevents runtime errors
5. **Fix CircularProgress** - Fixes component prop errors

## 📊 Expected Results

After applying these fixes:
- ✅ Build should complete successfully
- ✅ All 48 TypeScript errors should be resolved
- ✅ Frontend will compile without issues
- ✅ Your mock test history feature will be fully functional
