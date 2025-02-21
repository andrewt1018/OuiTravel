const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    console.log("Verifying token")
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(403).send({ message: 'No token provided.' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) {
        console.log("Verifying token failed");
        return res.status(403).send({ message: 'Unauthorized' });
      }
      // if everything good, save to request for use in other routes
      req.user = { id: decoded.id };
      console.log("Token verified successfully");
      next();
    });
};

module.exports = { verifyToken };
