const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controller/productController");
const {
  authenticateUser,
  authorizeUser,
} = require("../middleware/authentication");
const { getReviewsByProduct } = require("../controller/reviewController");

router.route("/").get(getAllProducts);
router.route("/:id").get(getProduct);

router
  .route("/createProduct")
  .post(authenticateUser, authorizeUser("admin"), createProduct);
router
  .route("/updateProduct/:id")
  .patch(authenticateUser, authorizeUser("admin"), updateProduct);
router
  .route("/deleteProduct/:id")
  .delete(authenticateUser, authorizeUser("admin"), deleteProduct);
router.route("/:id/reviews").get(getReviewsByProduct);

module.exports = router;
