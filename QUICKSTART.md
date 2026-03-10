# 快速开始指南

## 5分钟快速部署

### 选项1：使用Docker（最简单）

```bash
# 1. 进入项目目录
cd video-to-gif-converter-v2

# 2. 启动Docker容器
docker-compose up -d

# 3. 访问应用
# 打开浏览器访问 http://localhost:3000
```

**停止服务：**
```bash
docker-compose down
```

---

### 选项2：使用Node.js

```bash
# 1. 安装依赖
pnpm install

# 2. 构建项目
pnpm build

# 3. 启动服务
pnpm start
# 或使用serve
npx serve -s dist -l 3000

# 4. 访问应用
# 打开浏览器访问 http://localhost:3000
```

---

### 选项3：上传到Web服务器

#### 步骤1：本地构建
```bash
pnpm install
pnpm build
```

#### 步骤2：上传文件
- 将 `dist/` 目录中的所有文件上传到服务器
- 例如上传到 `/var/www/html/`

#### 步骤3：配置Web服务器

**Nginx（推荐）：**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

重启Nginx：
```bash
sudo systemctl restart nginx
```

**Apache：**
在 `.htaccess` 中添加：
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

---

## 系统要求

| 方案 | 要求 |
|-----|------|
| Docker | Docker 20.10+ |
| Node.js | Node 16+, pnpm 8+ |
| Web服务器 | Nginx / Apache / IIS |

---

## 常见问题

### Q: 如何更改端口？

**Docker：**
修改 `docker-compose.yml`：
```yaml
ports:
  - "8080:3000"  # 改为 8080
```

**Node.js：**
```bash
npx serve -s dist -l 8080
```

### Q: 如何启用HTTPS？

使用Nginx反向代理配置SSL证书：
```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ... 其他配置
}
```

### Q: 如何查看日志？

**Docker：**
```bash
docker-compose logs -f
```

**Node.js：**
直接查看控制台输出

### Q: 如何更新应用？

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 或使用Node.js
pnpm install
pnpm build
```

---

## 性能优化建议

1. **启用Gzip压缩**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **设置缓存策略**
   ```nginx
   location ~* \.(js|css|png|jpg|gif)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **使用CDN加速**
   - 将 `dist/` 中的静态文件上传到CDN
   - 在 `vite.config.ts` 中配置CDN路径

---

## 监控和维护

### 健康检查
```bash
curl http://localhost:3000
```

### 查看资源使用
```bash
# Docker
docker stats video-to-gif-converter

# Linux
top -p $(pgrep -f "serve")
```

### 定期备份
```bash
# 备份配置和数据
tar -czf backup-$(date +%Y%m%d).tar.gz dist/
```

---

## 下一步

- 阅读 [README.md](./README.md) 了解功能详情
- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解高级部署选项
- 访问 [http://localhost:3000](http://localhost:3000) 开始使用

---

**需要帮助？** 查看项目文档或提交Issue。
