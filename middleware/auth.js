const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.secretKey);
        req.userData = decoded;
        next();
    } catch(error) {
        return res.sendStatus(401);
    }
}