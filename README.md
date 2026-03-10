# 视频转GIF转换器 v2

一个功能强大的在线视频转GIF工具，支持多种模式和批量处理。

## 功能特性

### 🎬 三大工作模式

#### 1. 常规模式
- 单个视频快速转换为GIF
- 支持安卓、iOS 9键、iOS 26键三种规格
- 实时预览和参数调节
- 导出为ZIP包

#### 2. 套装模式
- 一个视频生成多种规格的GIF
- 包含常规GIF和套装GIF两套
- 自动生成视频首帧截图
- 完整的套装视频转换

#### 3. 魔盒模式 ✨
- 一次制作多套皮肤（最多支持多个）
- 每套皮肤独立处理
- **自动生成四合一动图**：
  - 安卓四合一.gif（合并所有皮肤的安卓9.gif）
  - iOS四合一.gif（合并所有皮肤的iOS9.gif）
- 完整的批量打包下载

### ⚙️ 高级功能

- **参数调节**：
  - 帧率（FPS）
  - 抽帧间隔
  - 播放速度倍率
  - 实时预览效果

- **批量处理**：
  - 多个视频同时处理
  - 进度跟踪
  - 错误恢复

- **智能打包**：
  - 自动生成规范的ZIP目录结构
  - 支持四合一GIF合并
  - 文件命名符合行业规范

### 📦 导出格式

**常规模式导出结构：**
```
3元【甜宝小猪软糯日常】/
├── iOS26.gif
├── iOS9.gif
├── iOS视频9.mp4
├── 安卓9.gif
├── 安卓视频.mp4
└── 安卓首帧.png
```

**魔盒模式导出结构：**
```
3元【魔盒名称】/
├── 皮肤1/
│   ├── iOS26.gif
│   ├── iOS9.gif
│   ├── 安卓9.gif
│   └── ...
├── 皮肤2/
│   └── ...
├── 安卓四合一.gif          ← 自动生成
└── iOS四合一.gif           ← 自动生成
```

## 技术栈

- **前端框架**：React 19
- **样式系统**：Tailwind CSS 4
- **UI组件**：shadcn/ui
- **构建工具**：Vite 7
- **语言**：TypeScript 5.6
- **GIF处理**：
  - gifshot（视频转GIF）
  - gifenc（GIF编码）
  - omggif（GIF解码）

## 快速开始

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

### 生产构建

```bash
# 构建优化版本
pnpm build

# 预览构建结果
pnpm preview
```

### 部署

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 项目结构

```
client/
├── public/                    # 静态资源
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/           # React组件
│   │   ├── ui/              # shadcn/ui组件
│   │   ├── VideoUploader.tsx # 视频上传组件
│   │   ├── GifPreviewPanel.tsx # GIF预览面板
│   │   ├── HistoryDialog.tsx # 历史记录
│   │   └── SpecsDialog.tsx   # 成品规格说明
│   ├── pages/               # 页面组件
│   │   ├── Home.tsx         # 常规模式
│   │   ├── Suit.tsx         # 套装模式
│   │   └── MagicBox.tsx     # 魔盒模式
│   ├── lib/                 # 工具库
│   │   ├── gifEngine.ts     # GIF转换引擎
│   │   ├── gifMerger.ts     # GIF合并工具
│   │   ├── zipPacker.ts     # ZIP打包工具
│   │   ├── historyStore.ts  # 历史记录存储
│   │   └── utils.ts         # 通用工具
│   ├── contexts/            # React Context
│   ├── App.tsx              # 应用入口
│   ├── main.tsx             # React挂载点
│   └── index.css            # 全局样式
├── index.html               # HTML模板
├── vite.config.ts           # Vite配置
├── tsconfig.json            # TypeScript配置
└── tailwind.config.js       # Tailwind配置
```

## 核心库说明

### gifEngine.ts
处理视频到GIF的转换：
- `convertVideoToGif()`：视频转GIF
- `extractFirstFrame()`：提取视频首帧
- `convertSuitVideo()`：套装视频转换

### gifMerger.ts
实现GIF合并功能：
- `mergeGifs()`：将多个GIF按顺序合并为一个
- 支持帧级别的解码和重新编码
- 自动处理不同尺寸的GIF

### zipPacker.ts
打包导出功能：
- `packRegular()`：常规模式打包
- `packSuit()`：套装模式打包
- `packMagicBox()`：魔盒模式打包

## 浏览器支持

| 浏览器 | 最低版本 |
|------|--------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## 性能指标

- 首屏加载：< 2s
- 视频处理：取决于视频长度和参数
- GIF合并：3-5个GIF约30-60秒
- 构建大小：~500KB（gzip）

## 已知限制

- 单个视频最大100MB
- 视频时长最多20秒（自动截断）
- 最多支持256色GIF
- 魔盒模式最多支持10套皮肤

## 更新日志

### v2.0.0 (2026-03-06)
- ✨ 新增魔盒模式四合一动图功能
- 🔧 修复导出文件命名规范
- 📦 新增gifenc和omggif依赖
- 🎨 优化UI和交互体验

### v1.0.0 (初始版本)
- 🎬 常规模式
- 📦 套装模式
- 🎁 基础魔盒模式

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交Issue
- 发送邮件
- 提交PR

---

**最后更新**：2026年3月6日
