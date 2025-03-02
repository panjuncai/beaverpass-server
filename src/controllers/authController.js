const authService = require("../services/authService");
const {
  validateRegister,
  validateLogin,
} = require("../validations/userValidation");

const register = async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) {
    return res.status(400).json({
      code: 1,
      msg: error.details.reduce((prev, i) => prev + i.message + ";", ""),
    });
  }
  
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ 
      code: 0, 
      msg: "Registration successful, please check your email for verification", 
      data: user 
    });
  } catch (e) {
    res.status(400).json({ code: 1, msg: e.message });
  }
};

const login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({
      code: 1,
      msg: error.details.reduce((prev, i) => prev + i.message + ";", ""),
    });
  }

  try {
    const user = await authService.loginUser(req.body);
    
    // 将用户信息存储在 session 中
    req.session.user = user;
    
    res.status(200).json({ 
      code: 0, 
      msg: "Login successful", 
      data: user 
    });
  } catch (e) {
    res.status(400).json({ code: 1, msg: e.message });
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((e) => {
      if (e) {
        console.error("Error destroying session:", e);
        return res.status(500).json({
          code: 1,
          msg: `Logout failed:${e.message}`,
        });
      }
      
      res.clearCookie("sessionId");
      res.status(200).json({ code: 0, msg: "Logout successfully" });
    });
  } catch (e) {
    console.error("Error during logout:", e);
    res.status(400), json({ code: 1, msg: e.message });
  }
};

const verify = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ code: 1, msg: "Invalid verification link" });
    }

    await authService.verifyUser(token);
    res.status(200).json({ code: 0, msg: "Email verified successfully" });
  } catch (e) {
    res.status(400).json({ code: 1, msg: e.message });
  }
};

const checkSession = async (req, res) => {
  if (req.session.user) {
    res.status(200).json({
      code: 0,
      msg: "Session is valid",
      data: req.session.user
    });
  } else {
    res.status(401).json({
      code: 4001,
      msg: "Not logged in"
    });
  }
};

module.exports = { register, login, logout, verify, checkSession };
