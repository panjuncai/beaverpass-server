# 用户认证测试示例

这个目录包含了使用 Prisma 进行用户认证的测试示例。

## 前提条件

1. 确保已经安装了所有依赖：
   ```bash
   npm install
   ```

2. 确保已经设置了环境变量：
   ```bash
   USE_PRISMA=true
   ```

3. 确保已经生成了 Prisma 客户端：
   ```bash
   npx prisma generate
   ```

## 示例说明

### 1. 用户注册

演示如何创建新用户。

```bash
node examples/auth/register.js
```

这将创建一个随机邮箱的测试用户，并输出验证链接。

### 2. 用户登录

演示如何验证用户登录。

```bash
node examples/auth/login.js
```

注意：需要修改脚本中的邮箱和密码为实际存在的用户。

### 3. 邮箱验证

演示如何验证用户邮箱。

```bash
node examples/auth/verify.js <验证令牌>
```

验证令牌可以从注册示例的输出中获取。

### 4. 更新用户信息

演示如何更新用户信息。

```bash
node examples/auth/update.js <用户ID>
```

用户ID可以从注册或登录示例的输出中获取。

## 注意事项

- 这些示例仅用于测试和学习目的，不应在生产环境中直接使用。
- 示例中使用的邮箱和密码应该替换为实际的测试数据。
- 在运行这些示例之前，确保数据库连接正常。 