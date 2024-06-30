const Review = require("../models/Review");
const Product = require("../models/Product");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const checkPermissions = require("../utils/checkPermissions");

const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product found with id : ${productId}`);
  }

  const alreadyReviewed = await Review.findOne({ product: productId, user: req.user.userId });
  if (alreadyReviewed) {
    throw new CustomError.BadRequestError("You have already reviewed this product");
  }
  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate([{
    path: "product",
    select: "name company price",
    
  }
]);
  res.status(StatusCodes.OK).json({ reviews, nbHits: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewID } = req.params;
  const review = await Review.findOne({ _id: reviewID });
  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id : ${reviewID}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewID } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: reviewID });
  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id : ${reviewID}`);
  }
  checkPermissions(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();

  res.status(StatusCodes.OK).json({ msg: "Successfully Updated !" });
};

const deleteReview = async (req, res) => {
  const { id: reviewID } = req.params;
  const review = await Review.findOne({ _id: reviewID });
  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id : ${reviewID}`);
  }
  console.log(review.user, req.user);
  checkPermissions(req.user, review.user);
  await review.remove();

  res.status(StatusCodes.OK).json({ msg: "Successfully Removed !" });
};

const getReviewsByProduct = async (req, res) => {
  const { id: productId } = req.params;
  console.log(productId);
  const reviews = await Review.find({ product: productId }).populate(
  {
    path: "user",
    select: "_id name",
  });
  console.log(reviews);
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getReviewsByProduct
};
