// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(req, res, next) {
  // 1. Get the token from the request's cookies
  const token = req.cookies.token;
  
  // Check if token exists
  if (!token) {
    // If it's an API request, send JSON. Otherwise, redirect to login.
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    return res.redirect('/login');
  }

  // 2. Verify the token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 3. Add the user's info to the request object
    req.user = decoded; 
    
    // 4. Continue to the next part of the app
    next();

  } catch (err) {
    // If token is invalid (expired, etc.)
    // Clear the bad cookie and send to login
    res.clearCookie('token');
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Token is not valid' });
    }
    res.redirect('/login');
  }
};