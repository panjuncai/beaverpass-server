// 白名单接口直接放行
const operationsWithoutAuth = ['Login','Register','VerifyUser','CheckSession','Logout'];
const auth = (req, res, next) => {
  // console.log(`req.body:${JSON.stringify(req.body)}`);
  if(req.body.operationName!=='CheckSession'){
    console.log(`req.body:${JSON.stringify(req.body,null,2)}`);
  }
  if(req.body&&req.body.operationName&&operationsWithoutAuth.includes(req.body.operationName)){
    return next();
  }
  if (!req.session.user) {
    return res.status(401).json({
      code: 4001,
      msg: "Not logged in"
    });
  }
  // console.log(req.session.user)
  // 将用户信息添加到请求对象中
  req.user = req.session.user;
  next();
};

export default auth;
