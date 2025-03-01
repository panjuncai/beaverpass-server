const mongoose=require('mongoose')
const userService=require('../services/userService')

const getUserById=async (req,res)=>{
    try {
        const {userId}=req.params;
        
        const user=await userService.getUserById(userId)
        return res.status(200).json({code:0,msg:"User found",data:user})
    } catch (e) {
       return res.status(400).json({code:1,msg:e.message})
    }
}

// 更新用户信息
const updateUser = async (req, res) => {
  try {
    const {userId}=req.params;
    
    // 验证用户只能更新自己的信息
    if (userId !== req.user._id.toString()) {
      throw new Error("You are not authorized to update this user's information");
    }
    
    const userData = req.body;
    const updatedUser = await userService.updateUser(userId, userData);
    
    res.status(200).json({ code: 0, msg: "User information updated successfully", data: updatedUser });
  } catch (e) {
    res.status(200).json({ code: 1, msg: e.message });
  }
};

module.exports={getUserById,updateUser}