const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  const token = req.session.jwt;
  console.log('JWT from session:',token);
  if (!token) {
    return res.status(401).json({ code: 1, msg: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, 'miaowu');
    req.userId = decoded.userId;
    // console.log(`req.user is ${JSON.stringify(req.user)}`)
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      res.status(403).json({ code: 1, msg: "Token expired" });
    } else {
      res.status(403).json({ code: 1, msg: e.message });
    }
  }
};

module.exports = authMiddleware;
