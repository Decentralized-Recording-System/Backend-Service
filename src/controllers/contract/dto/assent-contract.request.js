const Joi = require("joi");

const AssentContractRequest = Joi.object().keys({
  singName: Joi.string().required().min(0).max(40),
  contractId: Joi.string().required().min(0).max(40)
});

module.exports = { AssentContractRequest };
