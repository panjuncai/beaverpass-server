const User=require('../models/User');
const bcrypt=require('bcryptjs')

const registerUser=async (username,password)=>{
    const existingUser=await User.findOne({username});
    if(existingUser){
        throw new Error('User already exists');
    }

    const hashedPassword=await bcrypt.hash(password,10);
    const user=await User.create({username,password:hashedPassword});
    await user.save();
    return user;
}

module.exports={registerUser}