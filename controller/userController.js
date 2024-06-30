const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const checkPermissions  = require("../utils/checkPermissions");
const createUserToken  = require("../utils/createUserToken");
const { attachCookiesToResponse } = require("../utils/jwt");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users, count: users.length });
};

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findOne({ _id: userId }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${userId}`);
  }
  console.log(req.user.userId, userId);
  checkPermissions(req.user, userId);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  console.log(req.user);
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { userId } = req.user;
  const { name, email } = req.body;
  if(!name || !email) {
    throw new CustomError.BadRequestError("Name and email fields are required");
  }
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { name, email },
    { new: true, runValidators: true }
  );
 const tokenUser = createUserToken(user);
 attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${userId}`);
  }
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.BadRequestError("Invalid password");
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ message: "Password updated" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
