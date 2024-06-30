const Order = require("../models/Order");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const checkPermissions = require("../utils/checkPermissions");
const Product = require("../models/Product");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const createOrder = async (req, res) => {
  const { items: items } = req.body;
  let { shippingFee } = req.body;
  if (!shippingFee) {
    throw new CustomError.BadRequestError("Please provide all fields");
  }

  let orderItems = [];
  let subtotal = 0;

  const product = await Product.findOne({ _id: items[0].productId });
  if (!product) {
    throw new CustomError.NotFoundError(
      `No product with id : ${items[0].productId}`
    );
  }
  if (product.freeShipping === true) {
    shippingFee = 0;
  }

  const { name, image, price, _id } = product;
  const singleOrderItem = {
    amount: items[0].quantity,
    name: name,
    image: image,
    price: price,
    product: _id,
  };

  orderItems = [...orderItems, singleOrderItem];
  console.log(subtotal);
  subtotal = items[0].quantity * price;
  console.log(subtotal);

  const total = subtotal + shippingFee;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total * 100,
    currency: "usd",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  const order = await Order.create({
    shippingFee,
    total,
    orderItems,
    user: req.user.userId,
    clientSecret: paymentIntent.client_secret,
  });

  res.status(StatusCodes.CREATED).json({ order, clientSecret: paymentIntent.client_secret, count: order.length });
};

const updateOrder = async (req, res) => {
  console.log(req.body);
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  order.paymentId = paymentIntentId;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
