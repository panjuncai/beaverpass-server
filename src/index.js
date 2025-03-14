// 加载环境变量
import loadEnv from "./config/env.js";
loadEnv();

// 导入外部核心模块
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { createServer } from "http";

// 自定义核心模块
import { createApolloServer } from "./graphql/index.js";
import supabaseAuth from "./middleware/supabaseAuth.js";

// 设置端口
const PORT = process.env.PORT || 4001;

// 初始化 Prisma 客户端
const prisma = new PrismaClient();

// 检查环境变量是否加载成功的函数
function checkEnvironmentVariables() {
  console.log('\n======== 环境变量检查 ========');
  
  // 检查必要的环境变量
  const requiredVars = [
    'DATABASE_URL',
    'SUPABASE_URL',     // 添加 Supabase URL
    'SUPABASE_SERVICE_KEY', // 添加 Supabase 服务密钥
    'NODE_ENV'
  ];
  
  // 检查可选但重要的环境变量
  const optionalVars = [
    'PORT',
    'DIRECT_URL',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME'
  ];
  
  // 检查必要的环境变量
  let missingRequired = false;
  console.log('必要环境变量:');
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      // 对于敏感信息，只显示是否存在，不显示具体值
      if (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('PASSWORD') || varName.includes('URL')) {
        console.log(`✅ ${varName}: [已设置]`);
      } else {
        console.log(`✅ ${varName}: ${process.env[varName]}`);
      }
    } else {
      console.log(`❌ ${varName}: 未设置`);
      missingRequired = true;
    }
  }
  
  // 检查可选的环境变量
  console.log('\n可选环境变量:');
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      // 对于敏感信息，只显示是否存在，不显示具体值
      if (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('PASSWORD') || varName.includes('URL')) {
        console.log(`✅ ${varName}: [已设置]`);
      } else {
        console.log(`✅ ${varName}: ${process.env[varName]}`);
      }
    } else {
      console.log(`⚠️ ${varName}: 未设置`);
    }
  }
  
  console.log('\n当前环境:', process.env.NODE_ENV || 'development');
  
  if (missingRequired) {
    console.log('\n⚠️ 警告: 一些必要的环境变量未设置，这可能导致应用程序无法正常工作。');
  } else {
    console.log('\n✅ 所有必要的环境变量已设置。');
  }
  
  console.log('==============================\n');
  
  return !missingRequired;
}

async function startServer() {
  try {
    // 检查环境变量
    const envCheckPassed = checkEnvironmentVariables();
    if (!envCheckPassed) {
      console.warn('环境变量检查未通过，但尝试继续启动服务器...');
    }

    // 初始化 express 应用
    const app = express();
    
    // 设置 CORS 策略
    const allowedOrigins = [
      "https://www.bigclouder.com",
      "https://bigclouder.com",
      "http://localhost:5173",
    ];
    app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, origin);
          } else {
            callback(new Error("不允许的CORS来源"));
          }
        },
        credentials: true,
      })
    );

    // 设置 bodyParser 中间件
    app.use(bodyParser.json({ limit: "10mb" }));
    app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

    // 设置 Supabase 身份验证中间件
    app.use(supabaseAuth);

    // 设置请求日志中间件
    app.use((req, _, next) => {
      console.log(`收到请求: ${req.method} ${req.url}`);
      next();
    });

    // 创建 Apollo Server
    const apolloServer = createApolloServer();
    
    // 启动 Apollo Server
    await apolloServer.start();
    
    // 将 Apollo 中间件应用到 Express
    apolloServer.applyMiddleware({ app, cors: false });
    
    // 创建 HTTP 服务器
    const httpServer = createServer(app);

    // 使用PORT变量来监听
    httpServer.listen(PORT, () => {
      console.log(`🚀 服务器已启动: http://localhost:${PORT}`);
      console.log(`🚀 GraphQL服务已启动: http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });

    // 处理优雅关闭
    const shutdown = async () => {
      console.log('正在关闭服务器...');
      
      // 断开 Prisma 连接
      await prisma.$disconnect();
      
      // 关闭 HTTP 服务器
      httpServer.close(() => {
        console.log('服务器已成功关闭');
        process.exit(0);
      });
    };
    
    // 处理进程终止
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
  } catch (error) {
    console.error('启动服务器时出错:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// 启动服务器
startServer();
