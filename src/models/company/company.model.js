const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companySchema = new Schema(
  {
    companyId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    companyName: { type: String, required: true, unique: false },
    active: { type: Boolean, required: true, default: false },
    password: { type: String, required: true },
    banStatus: { type: Boolean, require: false, default: false },
    resetPasswordToken: { type: Number, required: false, default: null },
    resetPasswordExpires: { type: Date, required: false, default: null },
    emailToken: { type: Number, required: false, default: null },
    emailTokenExpires: { type: Date, required: false, default: null },
    accessToken: { type: String, required: false, default: null },
    mnemonic: { type: String, required: false, default: null },
    address: { type: String, required: false, default: null },
    publicKey: { type: String, required: false, default: null },
    activeCompany: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
const Company = mongoose.model("company", companySchema);
module.exports = { Company };
