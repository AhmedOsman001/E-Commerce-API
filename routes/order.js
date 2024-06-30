const express = require("express");
const router = express.Router();

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require("../controller/orderController");

const {
  authenticateUser,
  authorizeUser,
} = require("../middleware/authentication");

router
  .route("/")
  .get(authenticateUser, authorizeUser("admin"), getAllOrders)
  .post(authenticateUser, createOrder);

router.route("/userOrders").get(authenticateUser, getCurrentUserOrders);

router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

module.exports = router;