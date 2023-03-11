const Joi = require("joi");

const CreatePromotionCodeRequest = Joi.object().keys({
  promotionCodeName: Joi.string().required().min(0).max(40),
  discount: Joi.number().required().min(0).max(100),
  description: Joi.string().required().min(0).max(600),
  quantity: Joi.number().required().min(0).max(200),
  start: Joi.date().iso().min(new Date()).required(),
  expires: Joi.date().iso().min(new Date()).required(),
});

module.exports = { CreatePromotionCodeRequest };
