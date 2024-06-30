const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controller/userController");
const {
  authenticateUser,
  authorizeUser,
} = require("../middleware/authentication");

router.route("/").get(authenticateUser, authorizeUser("admin"), getAllUsers);
router.route("/show-current").get(authenticateUser, showCurrentUser);
router.route("/update-user-password").patch(authenticateUser, updateUserPassword);
router.route("/update-user").patch(authenticateUser, updateUser);
router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
