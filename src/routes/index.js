const userRouter = require('./users');
const companyRouter = require('./company');
const modelContractRouter = require("./model-contract");
const contractRouter = require("./contract");
const promotionCode = require("./promotion-code");

module.exports = {
  modelContractRouter,
  userRouter,
  companyRouter,
  contractRouter,
  promotionCode,
};