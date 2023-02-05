const Joi = require('joi');

const CreateContractRequest = Joi.object().keys({
	userId:  Joi.string().required().min(0).max(40),
	carId:  Joi.string().required().min(4).max(15),
    contractValue: Joi.number().required().min(0),
	contractType: Joi.string().optional(),
    contractData: Joi.string().optional()
});

module.exports = { CreateContractRequest };