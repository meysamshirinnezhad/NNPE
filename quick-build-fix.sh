#!/bin/bash

echo "🔧 Fixing TypeScript Build Errors..."

# 1. Install missing @types/node
echo "📦 Installing @types/node..."
cd front && npm install --save-dev @types/node

# 2. Fix profile page unused imports
echo "🔧 Fixing profile page imports..."
sed -i 's/import { userService, testService } from/import { userService } from/' src/pages/profile/page.tsx
sed -i '/import type { TestHistoryItem }/d' src/pages/profile/page.tsx
sed -i '/const navigate = useNavigate();/d' src/pages/profile/page.tsx

# 3. Fix Button component variants
echo "🔧 Fixing Button component variants..."
sed -i 's/variant="outline"/variant="secondary"/g' src/pages/topics/detail/page.tsx

# 4. Fix CircularProgress className
echo "🔧 Fixing CircularProgress component..."
sed -i '/className={getMasteryColor/d' src/pages/topics/detail/page.tsx

# 5. Fix TestHistory component test_key parameter
echo "🔧 Fixing TestHistory component..."
sed -i '/test_key: testKey,/d' src/components/test-history/TestHistory.tsx

# 6. Fix TypeScript config
echo "🔧 Fixing TypeScript configuration..."
sed -i '/erasableSyntaxOnly/d' tsconfig.app.json
sed -i '/erasableSyntaxOnly/d' tsconfig.node.json

# 7. Fix Vite config Node.js types
echo "🔧 Fixing Vite configuration..."
cat > src/vite.config.ts << 'EOF'
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
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
EOF

echo "✅ Build fixes applied! Now try: npm run build"
