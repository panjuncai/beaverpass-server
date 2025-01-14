const userService = require("../services/userService");
const { validateRegister, validateLogin } = require("../validations/userValidation");

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

module.exports = { register,login };
