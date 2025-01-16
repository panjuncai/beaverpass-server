const session=require('express-session')
const {RedisStore}=require('connect-redis')
const redis=require('redis')
const redisClient=redis.createClient()
redisClient.on('error',(err)=>console.error(`Redis error:${err}`))
redisClient.on('connect',()=>console.log('Connected to Redis'))

(async () => {
    try {
        await redisClient.connect();
        console.log('Redis client connected successfully');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

const redis = require('redis');

// 创建 Redis 客户端
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.error(`Redis error: ${err}`);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

(async () => {
    try {
        await redisClient.connect();
        console.log('Redis client connected successfully');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();
