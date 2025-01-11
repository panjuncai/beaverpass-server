const mongoose=require('mongoose')
const dotenv=require('dotenv')

dotenv.config()

const connectDB=async ()=>{
    try {
        const dbUri = process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : process.env.MONGODB_URI_DEV;
        await mongoose.connect(dbUri)
        console.log('MongoDB Connected')
    }catch(e){
        console.error('MongoDB connection error:',e)
        process.exit(1)
    }
}

module.exports=connectDB