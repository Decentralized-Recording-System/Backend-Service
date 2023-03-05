const Joi = require("joi");

const GetContractById = Joi.object().keys({
  contractId: Joi.string().required().min(0).max(40),
});

module.exports = { GetContractById };
