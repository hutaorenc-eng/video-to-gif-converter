# Video to GIF Converter - Netlify部署指南

## 🚀 快速部署

### 自动部署（推荐）
1. 连接GitHub仓库到Netlify
2. 构建设置会自动应用
3. 代码推送自动部署

### 手动部署
如果自动部署失败，请在Netlify中设置：

**构建设置**：
```
Build command: npm run netlify-build
Publish directory: dist/public
```

**环境变量**：
```
NODE_VERSION: 18
NPM_FLAGS: --legacy-peer-deps
NPM_CONFIG_LEGACY_PEER_DEPS: true
```

## 🔧 解决方案特点

✅ 依赖兼容性修复
✅ Node版本锁定
✅ peer dependencies处理
✅ 构建优化
✅ 缓存策略

## 📋 构建流程

1. 自动检测Node版本
2. 使用legacy-peer-deps安装依赖
3. 优化构建配置
4. 自动部署到全球CDN

## 🎯 访问地址

部署成功后访问：
`https://your-name.netlify.app`