const jwt = require("jsonwebtoken");

module.exports = {
  generateJWT: async (user) => {
    var payload = { userId: user.id };
    var token = await jwt.sign(payload, process.env.SECRET);
    return token;
  },
  verifyToken: async (req, res, next) => {
    var token = req.headers["authorization"] || "";
    if (token) {
      try {
        var payload = jwt.verify(token, process.env.SECRET);
        req.user = payload;
        req.user.token = token;
        next();
      } catch (error) {
        return res.status(499).json({ message: "Please Login", error });
      }
    } else {
      return res.status(499).json({ message: "Please Login" });
    }
  },
};
