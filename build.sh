#!/bin/bash

echo "🚀 开始Netlify构建流程..."

# 设置环境变量
export NODE_VERSION=18
export NPM_FLAGS="--legacy-peer-deps"
export NPM_CONFIG_LEGACY_PEER_DEPS=true

echo "📦 安装依赖..."
npm ci --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败，尝试强制安装..."
    npm ci --legacy-peer-deps --force
fi

echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败"
    exit 1
fi