const Joi = require("joi");

const userSchema = Joi.object().keys({
  email: Joi.string().email({ minDomainSegments: 2 }),
  name: Joi.string().required().max(50),
  lastName: Joi.string().required().max(50),
  gender: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  password: Joi.string().required().min(4),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  macAddress: Joi.string().required().max(20),
  carModel: Joi.string().required().max(20),
  carLicenseNo: Joi.string().required().max(20),
  carChassisNo: Joi.string().required().max(20),
  carModelYr: Joi.number().required().max(3000),
  carBodyType: Joi.string().required().max(20),
  carNoOfSeats: Joi.number().required().max(50),
  carDisplacement: Joi.number().required(),
  carGVM: Joi.number().required(),
});

module.exports = { userSchema };
