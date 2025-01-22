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
    const { error } = validateLogin(req.body);
    if (error) {
        res.status(400).json({ code: 1, msg: error.details.reduce((prev, i) => prev + i.message + ";", "") });
    }

    try {
        const user = await userService.loginUser(req.body);
        // generate JWT
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.SECRET_KEY_VERIFY, { expiresIn: "1h" })

        req.session.jwt=token;
        // console.log('Stored token in session:', req.session.jwt);
        res.status(200).json({ code: 0, msg:"Login successfully", data: user })
    } catch (e) {
        res.status(400).json({ code: 1, msg: e.message })
    }
}

const logout=async (req,res)=>{
    try{
       req.session.destroy((e)=>{
        if(e){
            console.error('Error destroying session:',e)
            return res.status(500).json({
                code:1,msg:`Logout failed:${e.message}`
            })
        }
        res.clearCookie("connect.sid",{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production'
        })
        res.status(200).json({code:0,msg:'Logout successfully'})
        console.log('Logout successfully')
       }) 
    }catch(e){
        console.error("Error during logout:", e);
        res.status(400),json({code:1,msg:e.message})
    }
}

const verify = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ code: 1, msg: 'Invalid link' })
        }

        // decrype token
        const payload = jwt.verify(token, process.env.SECRET_KEY_VERIFY)
        const { userId } = payload;
        await userService.verifyUser(userId);
        res.status(200).json({ code: 0, msg: "User verified successfully" })
        // return res.redirect(`${process.env.BASE_URI}/login`)
    } catch (e) {
        res.status(400).json({ code: 1, msg: e.message })
    }
}

const user=async (req,res)=>{
    try {
        const user=await userService.getUser(req.userId);
        res.status(200).json({ code: 0, msg: "User found", data: user });
    } catch (e) {
        res.status(400).json({ code: 1, msg: e.message })
    }
}

module.exports = { register, login,logout, verify,user };
