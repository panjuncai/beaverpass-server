const User = require("../models/User")

const getUserById=async (userId)=>{
    try {
        const user=await User.findById(userId);
        if(!user){
            throw new Error("User is not exists")
        }
        return user;
    } catch (e) {
        throw e;
    }
}

module.exports= {getUserById}