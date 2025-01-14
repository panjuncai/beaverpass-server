const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    isVerified:{type:Boolean,required:true}
},{timestamps:true,versionKey:false})

userSchema.methods.toJSON=function(){
    const user=this.toObject();
    delete user.password;
    return user;
}
const User=mongoose.model('User',userSchema)

module.exports=User