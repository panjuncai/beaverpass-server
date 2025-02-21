require("./config/env")();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes=require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const postRoutes = require("./routes/postRoutes");

const session = require("express-session");
const { RedisStore } = require("connect-redis");
const redis = require("redis");
const redisClient = redis.createClient();
redisClient.on("error", (err) => console.error(`Redis error:${err}`));
redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.connect(); // v4 redis should connect

const app = express();
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
      maxAge: 600000, // one hour expire
    },
  })
);

app.use((req, res, next) => {
  console.log(`Request received:${req.method} ${req.url}`);
  next();
});


app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/users",userRoutes)
app.use("/posts", postRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
