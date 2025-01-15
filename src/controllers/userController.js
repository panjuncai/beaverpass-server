const userService = require("../services/userService");
const jwt = require("jsonwebtoken");
const { validateRegister, validateLogin } = require("../validations/userValidation");
require('../config/env')()

const register = async (req, res) => {
    const { error } = validateRegister(req.body);
    if (error) {
        return res.status(400).json({ code: 1, msg: error.details.reduce((prev, i) => prev + i.message + ";", "") });
    }

    try {
        const user = await userService.registerUser(req.body);
        res
            .status(201)
            .json({ code: 0, msg: "User registered successfully", data: user });
    } catch (e) {
        res.status(400).json({ code: 1, msg: e.message });
    }
};

const login = async (req, res) => {
    const {error}=validateLogin(req.body);
    if(error){
        res.status(400).json({code:1,msg:error.details.reduce((prev,i)=>prev+i.message+";","")});
    }

    try {
        const user = await userService.loginUser(req.body);
        res.status(200).json({code:0,msg:"User logged in successfully",data:user})
    } catch (e) {
        res.status(400).json({code:1,msg:e.message})
    }
}

const verify=async(req,res)=>{
    try{
        const {token}=req.query;
        if(!token){
            return res.status(400).json({code:1,msg:'Invalid link'})
        }

        // decrype token
        const payload= jwt.verify(token,process.env.SECRET_KEY)
        const {userId}=payload;
        await userService.verifyUser(userId);
        res.status(200).json({code:0,msg:"User verified successfully"})
        // return res.redirect(`${process.env.BASE_URI}/login`)
    }catch(e){
        res.status(400).json({code:1,msg:e.message})
    }
}

module.exports = { register,login,verify };
