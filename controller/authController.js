const BadRequestError = require("../errors/bad-request");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { attachCookiesToResponse } = require("../utils/jwt");
const createUserToken = require('../utils/createUserToken');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new BadRequestError("Email already exists");
  }

  const role = req.body && req.body.role === "admin" ? "admin" : "user"; 
  const user = await User.create({ name, email, password, role });
  const tokenUser = createUserToken(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};


const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
   
  const user = await User.findOne({ email })
  if (!user) {
    throw new BadRequestError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new BadRequestError("Invalid Credentials");
  }
  const tokenUser = createUserToken(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie("token", "none", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'None', 
    secure: true, 
  });
  res.status(StatusCodes.OK).json({ message: "User logged out" });
};

module.exports = {
  register,
  login,
  logout,
};
