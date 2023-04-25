const Joi = require('joi');

const CreateModelContractRequest = Joi.object().keys({
	modelContractName:  Joi.string().required(),
    modelContractValue:  Joi.string().required(),
    data: Joi.array().min(1).required(),
});

module.exports = { CreateModelContractRequest };
