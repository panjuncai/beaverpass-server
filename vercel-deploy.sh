#!/bin/bash

# 清理缓存
rm -rf node_modules/.cache
rm -rf .vercel/cache

# 安装依赖
npm install

# 验证 Prisma schema
npx prisma validate

# 生成 Prisma 客户端
npx prisma generate

# 部署到 Vercel
vercel --prod 