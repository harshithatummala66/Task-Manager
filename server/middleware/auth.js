<<<<<<< HEAD
const jwt = require('jsonwebtoken');

   const protect = (req, res, next) => {
     const token = req.header('Authorization')?.split(' ')[1];
     if (!token) return res.status(401).json({ message: 'No token, auth denied' });
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
     } catch (err) {
       res.status(401).json({ message: 'Token is not valid' });
     }
   };

   const adminOnly = (req, res, next) => {
     if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Admins only' });
     next();
   };

=======
const jwt = require('jsonwebtoken');

   const protect = (req, res, next) => {
     const token = req.header('Authorization')?.split(' ')[1];
     if (!token) return res.status(401).json({ message: 'No token, auth denied' });
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
     } catch (err) {
       res.status(401).json({ message: 'Token is not valid' });
     }
   };

   const adminOnly = (req, res, next) => {
     if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Admins only' });
     next();
   };

>>>>>>> c7c79f83b9ea2a9441f404964b22d40eb15a741f
   module.exports = { protect, adminOnly };