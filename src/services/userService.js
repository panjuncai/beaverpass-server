const User=require('../models/User');
const bcrypt=require('bcryptjs')
const filter ={password:0}
const registerUser=async (email,password)=>{
    const existingUser=await User.findOne({email});
    if(existingUser){
        throw new Error('User already exists');
    }

    const hashedPassword=await bcrypt.hash(password,10);
    const user=await User.create({email,password:hashedPassword,isVerified:false});
    await user.save();
    return user;
}

module.exports={registerUser}