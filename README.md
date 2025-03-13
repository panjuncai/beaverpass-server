# BeaverPass Server

BeaverPass Server 是一个基于 Node.js 和 GraphQL 的后端服务，提供用户认证、订单管理等功能。

## 环境变量设置

项目依赖于多个环境变量来正确运行。请按照以下步骤设置环境变量：

1. 复制 `.env.example` 文件并重命名为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入实际的环境变量值：
   - 必需的环境变量：
     - `DATABASE_URL`: 数据库连接 URL
     - `SESSION_SECRET`: 会话密钥
     - `NODE_ENV`: 运行环境 (development/production)

3. 运行环境变量检查脚本确保所有必需的环境变量都已设置：
   ```bash
   npm run check-env
   ```

## 安装与运行

1. 安装依赖：
   ```bash
   npm install
   ```

2. 生成 Prisma 客户端（如果使用 Prisma）：
   ```bash
   npm run prisma:generate
   ```

3. 运行开发服务器：
   ```bash
   npm run dev
   ```

4. 运行生产服务器：
   ```bash
   npm start
   ```

## 项目结构

```
beaverpass-server/
├── src/                  # 源代码
│   ├── config/           # 配置文件
│   ├── graphql/          # GraphQL 相关文件
│   │   ├── resolvers/    # 解析器
│   │   ├── typeDefs/     # 类型定义
│   │   └── index.js      # GraphQL 服务器设置
│   ├── middlewares/      # 中间件
│   ├── models/           # 数据模型
│   ├── routes/           # REST API 路由
│   ├── scripts/          # 实用脚本
│   └── index.js          # 应用入口点
├── prisma/               # Prisma 配置和迁移
└── .env.example          # 环境变量示例
```

## 功能模块

- **用户认证**: 提供用户注册、登录和会话管理
- **订单管理**: 订单的创建、查询和状态更新
- **实时订阅**: 通过 GraphQL 订阅提供实时更新

## 其他文档

- [订单系统文档](./README-orders.md)

## 故障排除

如果遇到与环境变量相关的错误，请确保：

1. 所有必需的环境变量都已正确设置
2. 数据库连接 URL 格式正确且可访问 