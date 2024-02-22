const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; 
  if (!token) {
    
    req.isAuthenticated = false;
    return res.status(403).send({ message: 'No token provided!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded; 
    req.isAuthenticated = true; 
    next(); 
  } catch (error) {
    
    req.isAuthenticated = false;
    return res.status(403).send({ message: 'Auth failed!' }); 
  }
};

module.exports = verifyToken;