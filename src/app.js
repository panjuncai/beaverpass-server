require('./config/env')()
const express=require('express')
const bodyParser=require('body-parser')
const cors=require('cors')
const connectDB=require('./config/db')
const userRoutes=require('./routes/userRoutes')

const session=require('express-session')
const {RedisStore}=require('connect-redis')
const redis=require('redis')
const redisClient=redis.createClient()
redisClient.on('error',(err)=>console.error(`Redis error:${err}`))
redisClient.on('connect',()=>console.log('Connected to Redis'))
redisClient.connect()// v4 redis should connect

const app=express()
const PORT=process.env.PORT||4000

connectDB()

app.use(cors())
app.use(bodyParser.json())

app.use(session({
    store:new RedisStore({
        client:redisClient
    }),
    secret:process.env.SECRET_KEY_JWT,
    resave:false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,// prevent client access cookie
        // secure:process.env.NODE_ENV==='production',
        maxAge:60000 // one minute expire
    }
}))

app.use((req,res,next)=>{
    console.log(`Request received:${req.method} ${req.url}`)
    next()
})

// app.get('/',(req,res) => {
//     res.send("hello");
// });

app.use('/users',userRoutes)


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})