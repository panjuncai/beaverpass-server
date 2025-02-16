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

module.exports={getUserById}