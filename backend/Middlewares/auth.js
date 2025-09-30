
const jwt = require("jsonwebtoken");

module.exports = function (roles = []) {
  return (req, res, next) => {
    console.log("[Auth Middleware] Checking authorization for:", req.method, req.originalUrl);

    //  token extraction
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      console.log("[Auth Middleware] No token found in request");
      return res.status(401).json({ msg: "No token" });
    }

    try {
      console.log("[Auth Middleware] Verifying token...");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("[Auth Middleware] Token verified, user:", decoded);

      req.user = {
        id: decoded.id, 
        role: decoded.role,
        name: decoded.name || "",
      };

      // Role-based access check
      if (roles.length && !roles.includes(req.user.role)) {
        console.log("[Auth Middleware] Access denied - required roles:", roles, "user role:", req.user.role);
        return res.status(403).json({ msg: "Access denied" });
      }

      next();
    } catch (error) {
      console.error("[Auth Middleware] Token verification failed:", error.message);
      res.status(401).json({ msg: "Invalid token" });
    }
  };
};
