const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      code: 4001,
      msg: "Not logged in"
    });
  }
  
  // 将用户信息添加到请求对象中
  req.user = req.session.user;
  next();
};

module.exports = auth;
