const Joi = require("joi");

const getModelContractByIdRequest = Joi.object().keys({
  modelContractId: Joi.string().required(),
  companyId: Joi.string().required(),
});

module.exports = { getModelContractByIdRequest };
