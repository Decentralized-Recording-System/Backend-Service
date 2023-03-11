const Joi = require('joi');
const { ContractType } = require('../../../models/enum/contract.enum');

const CreateContractRequest = Joi.object().keys({
	companyId:  Joi.string().required().min(0).max(40),
	userId:  Joi.string().min(0).max(40),
	carId:  Joi.string().required().min(4).max(15),
    contractValue: Joi.number().required().min(0),
	contractModelType: Joi.string().valid(...Object.values(ContractType)).required(),
    contractData: Joi.string().required(),
	promotionCodeId: Joi.string().optional()
});

module.exports = { CreateContractRequest };