const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, nbHits: products.length });
};

const createProduct = async (req, res) => {
  console.log(req.body);
  console.log(req.user);
  req.body.user = req.user.userId;
  console.log(req.body.user);
  // if(!req.file || !req.file.image) {
  //     throw new CustomError.BadRequestError('Please upload an image');
  // }
  console.log(req.files);
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "file-upload",
    }
  );
  console.log(result);
  fs.unlinkSync(req.files.image.tempFilePath);

  const product = await Product.create({
    ...req.body,
    image: result.secure_url,
  });
  res.status(StatusCodes.CREATED).json({ product });
};

const getProduct = async (req, res) => {
  const { id: productID } = req.params;
  const product = await Product.findOne({ _id: productID });
  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productID } = req.params;
  let product = await Product.findOne({ _id: productID });
  product = await Product.findByIdAndUpdate(productID, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productID } = req.params;
  const product = await Product.findOneAndRemove({ _id: productID });
  res.status(StatusCodes.OK).json({ product });
};



module.exports = {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};
