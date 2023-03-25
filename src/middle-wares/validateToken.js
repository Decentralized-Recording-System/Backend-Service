const jwt = require("jsonwebtoken");

const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "You are not authenticated",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.decodedData = decodedData;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

module.exports = verifyAuth;
