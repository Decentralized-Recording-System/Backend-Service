const Joi = require('joi');

const userSchema = Joi.object().keys({
	email: Joi.string().email({ minDomainSegments: 2 }),
	name: Joi.string().required().max(50),
	lastName: Joi.string().required().max(50),
	gender: Joi.string().required(),
	dateOfBirth: Joi.date().required(),
	password: Joi.string().required().min(4),
	confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
	macAddress :Joi.string().required().max(20),
});

module.exports = { userSchema };