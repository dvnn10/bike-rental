const jwt = require('jsonwebtoken');
const config = require('config');

const checkManager = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  console.log();
  if (bearerHeader && bearerHeader.split(' ')[0] === 'Bearer') {
    const token = bearerHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err || user.userStatus != 'active' || user.userRole != 'manager') {
        if (err) {
          return res
            .status(401)
            .json({ success: false, msg: 'No/Invalid Token, Auth is denied' });
        } else {
          return res.status(401).json({
            success: false,
            msg: 'User Email not activated or is not Manager',
          });
        }
      } else {
        req.userId = user.userId;
        req.userRole = user.userRole;
        req.email = user.email;
        req.userStatus = user.userStatus;
        next();
      }
    });
  } else {
    return res
      .status(401)
      .json({ success: false, msg: 'No/Invalid Token, Auth is denied' });
  }
};

module.exports = checkManager;
