const express=require('express')
const bodyParser=require('body-parser')
const cors=require('cors')
const connectDB=require('./config/db')
const userRoutes=require('./routes/userRoutes')

const app=express()
const PORT=process.env.PORT||4000

connectDB()

app.use(cors())
app.use(bodyParser.json())
// app.use((req,res,next)=>{
//     console.log(`Request received:${req.method} ${req.url}`)
//     next()
// })
app.use('/users',userRoutes)


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})