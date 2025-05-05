const jwt = require("jsonwebtoken");
const SECRET_KEY = require("../config/auth").SECRET_KEY;

// Verify token function factory that returns middleware with specific role filtering
function verifyToken(allowedRoles) {
  return (req, res, next) => {
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Token manquant." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token manquant." });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token invalide ou expiré." });
      }

      if (!allowedRoles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: `Accès réservé à ${allowedRoles.join(" ou ")}.` });
      }

      req.user = decoded;
      next();
    });
  };
}

// Specialized token verification for avocat (lawyer) role
const verifyAvocatToken = verifyToken(["avocat"]);

// Specialized token verification for client role
const verifyClientToken = verifyToken(["client"]);

// Specialized token verification for admin role
const verifyAdminToken = verifyToken(["admin"]);

// Specialized token verification for both avocat and client roles
const verifyAvocatOrClientToken = verifyToken(["avocat", "client"]);

// Specialized token verification for both avocat and admin roles
const verifyAvocatOrAdminToken = verifyToken(["avocat", "admin"]);

// Specialized token verification for any of the three roles
const verifyAnyUserToken = verifyToken(["avocat", "client", "admin"]);

module.exports = {
  verifyToken,
  verifyAvocatToken,
  verifyClientToken,
  verifyAdminToken,
  verifyAvocatOrClientToken,
  verifyAvocatOrAdminToken,
  verifyAnyUserToken,
};
