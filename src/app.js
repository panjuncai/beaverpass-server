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
    }),
    secret: process.env.SECRET_KEY_JWT,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // prevent client access cookie
      // secure:process.env.NODE_ENV==='production',//必须开启 https才能设置
      maxAge: 1000*60*60*24*14 // 14 days
      // maxAge: 1000*60*2 // 2min
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

// Socket连接处理
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 加入聊天室
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // 离开聊天室
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 使用PORT变量来监听
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
