const Joi = require("joi");

const getModelContractById = Joi.object().keys({
  modelContractId: Joi.string().required(),
  companyId: Joi.string().required(),
});

module.exports = { getModelContractById };
