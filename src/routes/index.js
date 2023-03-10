const userRouter = require('./users');
const companyRouter = require('./company');
const modelContractRouter = require("./model-contract");
const contractRouter = require("./contract");

module.exports = {
  modelContractRouter,
  userRouter,
  companyRouter,
  contractRouter,
};