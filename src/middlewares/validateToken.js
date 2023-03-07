const jwt = require("jsonwebtoken");

const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err)
        return res
          .status(403)
          .json({ success: false, message: "Token is not valid" });
      req.decodedData = JSON.parse(atob(token.split(".")[1]));
      next();
    });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "You are not authenticated" });
  }
}
module.exports = verifyAuth;
