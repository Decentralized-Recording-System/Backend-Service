const Joi = require("joi");

const GetModelContractByCompanyRequest = Joi.object().keys({
  companyId: Joi.string().required(),
});

module.exports = { GetModelContractByCompanyRequest };
