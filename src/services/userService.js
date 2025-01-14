const User=require('../models/User');
const bcrypt=require('bcryptjs')
const filter ={password:0}
const registerUser=async ({email,password})=>{
    const existingUser=await User.findOne({email});
    if(existingUser){
        throw new Error('User already exists');
    }

    const hashedPassword=await bcrypt.hash(password,10);
    const user=await User.create({email,password:hashedPassword,isVerified:false});
    await user.save();
    return user;
}

const loginUser=async ({email,password})=>{
    let user=await User.findOne({email});
    if(!user){
        throw new Error('User is not exists');
    }
    
    const isMatched=await bcrypt.compare(password,user.password);
    if(!isMatched){
        throw new Error('Invalid password');
    }

    if(!user.isVerified){
        throw new Error('User is not verified');
    }
    return user;
}

module.exports={registerUser,loginUser}