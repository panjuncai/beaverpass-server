const express = require('express')
const app = express()

const session = require('express-session')
const { RedisStore } = require('connect-redis')
const redis = require('redis')
const redisClient = redis.createClient()
redisClient.on('error', (err) => console.error(`Redis error:${err}`))
redisClient.on('connect', () => console.log('Connected to Redis'))
redisClient.connect()// v4 redis should connect

app.use(session({
    store: new RedisStore({
        client: redisClient
    }),
    secret: '94c5bd3eba894fc0baa7c68e7abd31bde90f9dd0a1492b139acf69951d86ab9ac8f16acbca71a906a0f7cb012b04cc2af2f875ef16eb6cef4f8b55524caa25a9v',
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))

app.get('/', (req, res) => {
    req.session.views = (req.session.views || 0) + 1
    res.send("hello");
});

app.get('/count', (req, res) => {
    if (req.session.views) {
        res.send(`You have visited this page ${req.session.views} times`)
    } else {
        res.send('No session found!')
    }
});

app.listen(4001, () => {
    console.log('Server is running at port 4001')
})
