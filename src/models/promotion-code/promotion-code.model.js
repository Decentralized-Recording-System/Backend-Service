const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const promotionCode = new Schema(
  {
    promotionCodeId: { type: String, required: true, unique: true },
    promotionCodeName: { type: String, required: true, unique: true },
    companyId: { type: String, required: true },
    discount: { type: Number, required: true },
    description: { type: String, required: false },
    quantity: { type: Number, required: true },
    used: { type: Number, required: false ,default: 0},
    start: { type: Date, required: true },
    expires: { type: Date, required: true },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
const PromotionCode = mongoose.model("promotion-code", promotionCode);
module.exports = { PromotionCode };
