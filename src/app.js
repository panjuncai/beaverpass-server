require("./config/env")();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes=require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatRoutes = require("./routes/chatRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const redis = require("redis");
const redisClient = redis.createClient();
redisClient.on("error", (err) => console.error(`Redis error:${err}`));
redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.connect(); // v4 redis should connect
const http = require('http');
const app = express();
const server = http.createServer(app);
const ChatRoom = require('./models/ChatRoom');

// 初始化 socket.io
const socketIO = require('./socket');
const io = socketIO.init(server);  // 获取 io 实例并保存


const PORT = process.env.PORT || 4001;

connectDB();

const allowedOrigins = ['https://www.bigclouder.com', 'https://bigclouder.com','http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(bodyParser.json({limit:'10mb'}));
app.use(bodyParser.urlencoded({extended:true,limit:'10mb'}));

app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: "beaverpass:", // Redis key 前缀，避免冲突
    }),
    name: 'sessionId', // 自定义 cookie 名称，增加安全性
    secret: process.env.SESSION_SECRET, // 使用专门的 session secret
    resave: false, // 如果 session 没有修改，不重新保存
    saveUninitialized: false, // 不保存未初始化的 session
    rolling: true, // 每次请求都刷新 cookie 过期时间
    cookie: {
      httpOnly: true, // 防止客户端 JS 访问 cookie
      // secure: process.env.NODE_ENV === 'production', // 生产环境强制使用 HTTPS
      sameSite: 'lax', // 防止 CSRF 攻击
      maxAge: 1000 * 60 * 60 * 24 //  24h
    },
  })
);

app.use((req, res, next) => {
  console.log(`Request received:${req.method} ${req.url}`);
  next();
});


app.use("/auth", authRoutes);
app.use("/users",userRoutes)
app.use("/posts", postRoutes);
app.use("/orders", orderRoutes);
app.use("/chat", chatRoutes);
app.use("/payments", paymentRoutes);

// Socket连接处理
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 存储用户在线状态的Map
  const userRooms = new Map();

  // 加入聊天室
  socket.on('join_room', ({ roomId, userId }) => {
    socket.join(roomId);
    userRooms.set(socket.id, { roomId, userId });
    
    // 通知房间内其他用户该用户上线
    io.to(roomId).emit('user_status', {
      userId,
      roomId,
      status: 'online'
    });
    
    console.log(`User ${userId} joined room ${roomId}`);
  });

  // 处理发送消息
  socket.on('send_message', async ({ roomId, message, senderId }) => {
    try {
      // 查找聊天室以获取接收者ID
      const chatRoom = await ChatRoom.findById(roomId);
      if (!chatRoom) return;
      
      // 找到接收者ID (不是发送者的那个参与者)
      const receiver = chatRoom.participants.find(p => p._id.toString() !== senderId);
      const receiverId = receiver ? receiver._id.toString() : null;
      if(!receiverId) return;
      
      // 检查接收者是否在线
      const receiverOnline = Array.from(userRooms.values())
        .some(user => user.roomId === roomId && user.userId === receiverId);

      // 广播消息给房间内所有用户，包含发送者和接收者ID
      io.to(roomId).emit('new_message', {
        message,
        receiverOnline,
        senderId,
        receiverId
      });
    } catch (error) {
      console.error('Error in send_message handler:', error);
    }
  });

  // 处理消息已读
  socket.on('mark_read', async ({ roomId, userId }) => {
    try {
      // 更新数据库中的已读状态
      await ChatRoom.findOneAndUpdate(
        { 
          _id: roomId,
          'participants._id': userId 
        },
        {
          $set: { 'participants.$.unreadCount': 0 }
        }
      );
      const Message = require('./models/Message');
      
      // 标记该房间内所有未读消息为已读
      await Message.updateMany(
        {
          roomId,
          senderId: { $ne: userId },
          readBy: { $ne: userId }
        },
        {$addToSet: { readBy: userId }
      }
    );
      // 通知房间内所有用户消息已读
      io.to(roomId).emit('messages_read', { roomId, userId });
    } catch (error) {
      console.error('Error in mark_read handler:', error);
    }
  });

  // 离开聊天室
  socket.on('leave_room', ({ roomId, userId }) => {
    socket.leave(roomId);
    userRooms.delete(socket.id);
    
    // 通知房间内其他用户该用户离线
    io.to(roomId).emit('user_status', {
      userId,
      roomId,
      status: 'offline'
    });
    
    console.log(`User ${userId} left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    const userData = userRooms.get(socket.id);
    if (userData) {
      const { roomId, userId } = userData;
      // 通知房间内其他用户该用户离线
      io.to(roomId).emit('user_status', {
        userId,
        roomId,
        status: 'offline'
      });
      userRooms.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

// 使用PORT变量来监听
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
