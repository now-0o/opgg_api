const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).send("Header에 JWT 토큰을 넣아야합니다.");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
        if(err){
            if(err.name === "JsonWebTokenError"){
                return res.status(401).send("잘못된 토큰입니다.");
            }
            if(err.name === "TokenExpiredError"){
                return res.status(401).send("유효기간이 만료된 토큰입니다.");
            }
            return res.status(401).send(err);
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;