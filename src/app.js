const express=require('express')
const bodyParser=require('body-parser')
const connectDB=require('./config/db')
const userRoutes=require('./routes/userRoutes')

const app=express()
const PORT=process.env.PORT||4000

connectDB()

app.use(bodyParser.json())

app.use('/api/users',userRoutes)


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})