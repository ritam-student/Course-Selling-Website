const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.USER_JWT_SECRET


function userAuth(req , res , next){
    try{
        const token = req.headers.token;
        const response = jwt.verify(token , JWT_SECRET);
        if (response){
            req.user_id = response._id;
            req.name = response.name;
            next();
        }else {
            res.status(403).json({
                error : "Signup or signin first..."
            });
            return;
        }
    }catch (err) {
        res.status(404).json({
            error : err
        });
    }
}




module.exports = {
    userAuth
}