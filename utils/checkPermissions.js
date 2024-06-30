const CustomError = require('../errors');


const checkPermissions = (reqUser, resouceUserId) => {
  if (reqUser.role === "admin") return;
  if (reqUser.userId === resouceUserId.toString()) return;
  console.log(reqUser.userId, resouceUserId);
  throw new CustomError.UnauthenticatedError(
    "Not authorized to perform this action"
  );
};

module.exports = checkPermissions ;
