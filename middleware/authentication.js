const CustomError = require("../errors");
const { isTokenValid } = require("../utils/jwt");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    console.log("No token found");
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
  try {
    // console.log(token);
    const { name, userId, role } = isTokenValid({token});
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
};

const authorizeUser = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        throw new CustomError.UnauthenticatedError("Unauthorized");
    }
    next();
}


module.exports = { authenticateUser, authorizeUser };