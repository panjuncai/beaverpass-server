const userService = require("../services/userService");
const { validateRegister } = require("../validations/userValidation");

const register = async (req, res) => {
    const { error } = validateRegister(req.body);
    if (error) {
        return res.status(400).json({ code: 1, msg: error.details.reduce((prev,i)=> prev + i.message+";","") });
    }

    const { username, password } = req.body;

    try {
        const user = await userService.registerUser(username, password);
        res
            .status(201)
            .json({ code: 0, msg: "User registered successfully", data: user });
    } catch (e) {
        res.status(400).json({ code: 1, msg: e.message });
    }
};

module.exports = { register };
