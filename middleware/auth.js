const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next){
    // Get token from the header
    const token = req.header('x-auth-token');

    // Check if not token
    if(!token){
        return res.status(401).json({ msg: 'No token, authorization denied.'});
    }

    // Verify the token
    try{
        const decodedToken = jwt.verify(token, config.get('jwtSecret'));
        req.user = decodedToken.user;
        next();
    }catch(err){
        res.status(401).json({msg: 'Token is not valid.'});
    }
}