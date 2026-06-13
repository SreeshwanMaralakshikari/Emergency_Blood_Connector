import jwt from "jsonwebtoken";

export const verifyToken =
  (...allowedRoles) =>
  (req, res, next) => {
    try {
      const token =
        req.cookies.token;

      if (!token) {
        return res.status(401).json({
          message:
            "Unauthorized Access",
        });
      }

      const decodedToken =
        jwt.verify(
          token,
          process.env.SECRET_KEY
        );

      req.user = decodedToken;

      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(
          decodedToken.role
        )
      ) {
        return res.status(403).json({
          message:
            "Access Denied",
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        message:
          "Invalid Token",
      });
    }
  };