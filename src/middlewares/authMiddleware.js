const authMiddleware = (req, res, next) => {
  const token = req.session.jwt;
  if (!token) {
    res.status(401).json({ code: 1, msg: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);
    req.user = decoded;
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      res.status(403).json({ code: 1, msg: "Token expired" });
    } else {
      res.status(403).json({ code: 1, msg: "Invalid token" });
    }
  }
};

module.exports = authMiddleware;
