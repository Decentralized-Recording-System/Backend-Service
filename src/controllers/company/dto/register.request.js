const Joi = require('joi');

const companySchema = Joi.object().keys({
	email: Joi.string().email({ minDomainSegments: 2 }),
	companyName: Joi.string().required().max(50),
	password: Joi.string().required().min(4),
	confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
});

module.exports = { companySchema };