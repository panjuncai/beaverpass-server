# GraphQL 用户认证和帖子测试脚本

这个目录包含了用于测试 GraphQL 用户认证和帖子功能的脚本，包括注册、登录、验证、更新、登出和帖子创建等操作。

## 前提条件

1. 确保已经安装了所有依赖：
   ```
   npm install
   ```

2. 确保服务器正在运行：
   ```
   npm start
   ```

3. 确保 `.env` 文件中包含正确的数据库连接信息和其他必要的环境变量。

## 用户认证测试流程

按照以下顺序运行测试脚本：

### 1. 用户注册

```
node registerTest.js
```

这个脚本会创建一个新用户，并将用户信息保存到 `userTestInfo.json` 文件中。注册成功后，系统会向用户邮箱发送一封验证邮件。

### 2. 用户登录

```
node loginTest.js
```

这个脚本会使用 `userTestInfo.json` 中的用户信息进行登录，并检查会话状态。

### 3. 用户验证

从注册邮件中获取验证令牌，并将其添加到 `userTestInfo.json` 文件中的 `verificationToken` 字段，然后运行：

```
node verifyTest.js
```

这个脚本会验证用户的电子邮件。

### 4. 用户信息更新

```
node updateTest.js
```

这个脚本会更新用户的个人信息，包括姓名、头像、地址和电话号码。

### 5. 用户登出

```
node logoutTest.js
```

这个脚本会登出用户，并检查会话状态。

## 帖子功能测试流程

### 1. 创建帖子

```
node createPostTest.js
```

这个脚本会创建一个新帖子，并将帖子信息保存到 `postTestInfo.json` 文件中。创建帖子前，脚本会先登录用户以获取会话。

## 注意事项

1. 这些脚本使用 `node-fetch` 发送 HTTP 请求，确保已安装此依赖。
2. 脚本默认连接到 `http://localhost:4000/graphql`，可以通过设置环境变量 `API_URL` 来修改。
3. 脚本会自动设置 `USE_PRISMA=true`，确保使用 Prisma 进行数据库操作。
4. 验证令牌需要手动从注册邮件中获取，并添加到 `userTestInfo.json` 文件中。

## 用户测试信息文件

`userTestInfo.json` 文件包含以下字段：

```json
{
  "email": "用户邮箱",
  "password": "用户密码",
  "userId": "用户ID",
  "verificationToken": "验证令牌"
}
```

这个文件由 `registerTest.js` 创建，并由其他脚本使用和更新。

## 帖子测试信息文件

`postTestInfo.json` 文件包含以下字段：

```json
{
  "postId": "帖子ID",
  "title": "帖子标题",
  "category": "帖子类别"
}
```

这个文件由 `createPostTest.js` 创建，并可由其他帖子相关脚本使用。 