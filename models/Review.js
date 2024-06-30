const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide a comment"],
      maxlength: 500,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true }); //user can leave only one review per product

reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        numOfRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Product").findByIdAndUpdate(
      { _id: productId },
      {
        averageRating: stats[0]?.avgRating || 0,
        numOfReviews: stats[0]?.numOfRating || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post("remove", function () {
  this.constructor.calculateAverageRating(this.product);

});
module.exports = mongoose.model("Review", reviewSchema);
