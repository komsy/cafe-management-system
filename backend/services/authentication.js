require('dotenv').config()
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    //const authHeader = req.headers['authorizaion'];
    //const token = authHeader && authHeader.split(' ')[1];
    const token = req.headers.authorization.split(' ')[1];
    //console.log(token)
    if (token == null)
        return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, response) => {
        if (err)
            return res.sendStatus(403);
        res.locals = response;
        next();
    })
}



module.exports = { authenticateToken: authenticateToken }