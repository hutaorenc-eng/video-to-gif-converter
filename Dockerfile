# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY client ./client
COPY vite.config.ts tsconfig.json ./

# 构建项目
RUN pnpm build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 安装轻量级HTTP服务器
RUN npm install -g serve

# 从构建阶段复制构建结果
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["serve", "-s", "dist", "-l", "3000"]
