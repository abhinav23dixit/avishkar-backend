const jwt = require("jsonwebtoken");
const secret = "secret";
module.exports = function isAuthenticated(req, res, next) {
  const token = req.cookies.user || req.get("x-access-token");
  if (!token) return res.json({ message: "Not authenticated" });

  jwt.verify(token, secret, function(err, decoded) {
    if (err) return res.json({ message: "Not authenticated" });
    req.decoded = decoded;
    next();
  });
};
