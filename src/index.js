// 加载环境变量
import loadEnv from "./config/env.js";
loadEnv();



// 设置端口
const PORT = process.env.PORT || 4001;

// 导入外部核心模块
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { RedisStore } from "connect-redis";
// 自定义核心模块
import { setupApolloServer } from "./graphql/index.js";
import {connectDB,redisClient} from "./config/db.js";
import auth from "./middlewares/authMiddleware.js";
// import setupGraphQL from "./graphql/index.js";

// 导入路由
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import postRoutes from "./routes/postRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import chatRoutes from "./routes/chatRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
// import uploadRoutes from "./routes/uploadRoutes.js";

// 检查环境变量是否加载成功的函数
function checkEnvironmentVariables() {
  console.log('\n======== 环境变量检查 ========');
  
  // 检查必要的环境变量
  const requiredVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
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
  // 检查环境变量
  const envCheckPassed = checkEnvironmentVariables();
  if (!envCheckPassed) {
    console.warn('环境变量检查未通过，但尝试继续启动服务器...');
  }

  // 连接数据库
  await connectDB();

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
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  // 设置 bodyParser 中间件
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

  // 设置 session 中间件
  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
        prefix: "beaverpass:", // Redis key 前缀，避免冲突
      }),
      name: "sessionId", // 自定义 cookie 名称，增加安全性
      secret: process.env.SESSION_SECRET, // 使用专门的 session secret
      resave: false, // 如果 session 没有修改，不重新保存
      saveUninitialized: false, // 不保存未初始化的 session
      rolling: true, // 每次请求都刷新 cookie 过期时间
      cookie: {
        httpOnly: true, // 防止客户端 JS 访问 cookie
        // secure: process.env.NODE_ENV === 'production', // 生产环境强制使用 HTTPS
        sameSite: "lax", // 防止 CSRF 攻击
        maxAge: 1000 * 60 * 60 * 24, //  24h
      },
    })
  );

  // 设置 auth 中间件
  app.use(auth);

  // 设置请求日志中间件
  app.use((req, _, next) => {
    console.log(`Request received:${req.method} ${req.url}`);
    next();
  });

  // 设置 Apollo Server 和 WebSocket 订阅
  const httpServer = await setupApolloServer(app);

  // 使用PORT变量来监听
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
    console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
    // 暂时注释掉订阅相关的日志
    // console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
}

startServer();

// 初始化 socket.io
// const io = socketIO.init(server);  // 获取 io 实例并保存

// 设置路由
// app.use("/auth", authRoutes);
// app.use("/users",userRoutes)
// app.use("/posts", postRoutes);
// app.use("/orders", orderRoutes);
// app.use("/chat", chatRoutes);
// app.use("/payments", paymentRoutes);
// app.use("/upload", uploadRoutes);

// Socket连接处理
// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   // 存储用户在线状态的Map
//   const userRooms = new Map();

//   // 加入聊天室
//   socket.on('join_room', ({ roomId, userId }) => {
//     socket.join(roomId);
//     userRooms.set(socket.id, { roomId, userId });

//     // 通知房间内其他用户该用户上线
//     io.to(roomId).emit('user_status', {
//       userId,
//       roomId,
//       status: 'online'
//     });

//     console.log(`User ${userId} joined room ${roomId}`);
//   });

//   // 处理发送消息
//   socket.on('send_message', async ({ roomId, message, senderId }) => {
//     try {
//       // 查找聊天室以获取接收者ID
//       const chatRoom = await ChatRoom.findById(roomId);
//       if (!chatRoom) return;

//       // 找到接收者ID (不是发送者的那个参与者)
//       const receiver = chatRoom.participants.find(p => p._id.toString() !== senderId);
//       const receiverId = receiver ? receiver._id.toString() : null;
//       if(!receiverId) return;

//       // 检查接收者是否在线
//       const receiverOnline = Array.from(userRooms.values())
//         .some(user => user.roomId === roomId && user.userId === receiverId);

//       // 广播消息给房间内所有用户，包含发送者和接收者ID
//       io.to(roomId).emit('new_message', {
//         message,
//         receiverOnline,
//         senderId,
//         receiverId
//       });
//     } catch (error) {
//       console.error('Error in send_message handler:', error);
//     }
//   });

//   // 处理消息已读
//   socket.on('mark_read', async ({ roomId, userId }) => {
//     try {
//       // 更新数据库中的已读状态
//       await ChatRoom.findOneAndUpdate(
//         {
//           _id: roomId,
//           'participants._id': userId
//         },
//         {
//           $set: { 'participants.$.unreadCount': 0 }
//         }
//       );
//       const Message = require('./models/Message');

//       // 标记该房间内所有未读消息为已读
//       await Message.updateMany(
//         {
//           roomId,
//           senderId: { $ne: userId },
//           readBy: { $ne: userId }
//         },
//         {$addToSet: { readBy: userId }
//       }
//     );
//       // 通知房间内所有用户消息已读
//       io.to(roomId).emit('messages_read', { roomId, userId });
//     } catch (error) {
//       console.error('Error in mark_read handler:', error);
//     }
//   });

//   // 离开聊天室
//   socket.on('leave_room', ({ roomId, userId }) => {
//     socket.leave(roomId);
//     userRooms.delete(socket.id);

//     // 通知房间内其他用户该用户离线
//     io.to(roomId).emit('user_status', {
//       userId,
//       roomId,
//       status: 'offline'
//     });

//     console.log(`User ${userId} left room ${roomId}`);
//   });

//   socket.on('disconnect', () => {
//     const userData = userRooms.get(socket.id);
//     if (userData) {
//       const { roomId, userId } = userData;
//       // 通知房间内其他用户该用户离线
//       io.to(roomId).emit('user_status', {
//         userId,
//         roomId,
//         status: 'offline'
//       });
//       userRooms.delete(socket.id);
//     }
//     console.log('User disconnected:', socket.id);
//   });
// });
