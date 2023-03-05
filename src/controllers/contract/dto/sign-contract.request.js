const Joi = require("joi");

const signContractRequest = Joi.object().keys({
  contractId: Joi.string().required().min(0).max(40),
});

module.exports = { signContractRequest };
