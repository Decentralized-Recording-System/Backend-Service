require("dotenv").config();
const shortid = require('shortid');
const { Company } = require("../../models/company/company.model");
const { CreatePromotionCodeRequest,} = require("./dto/create-promotion-code.request");
const { PromotionCode,} = require("../../models/promotion-code/promotion-code.model");
const { sendPromotionCodeEmail } = require("../../utils/helpers/mailer/promotion-code.mailer");
const { Users } = require("../../models/users/user.model");

exports.CreatePromotionCode = async (req, res) => {
  try {
    const { id } = req.decodedData;

    const company = await Company.findOne({ companyId: id });

    const result = CreatePromotionCodeRequest.validate(req.body);

    if (result.error) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: result.error.message,
      });
    }

    const promotionCodeId = shortid.generate();
    result.value.promotionCodeId = promotionCodeId;
    result.value.companyId = company.companyId;

    const newPromotionCode = new PromotionCode(result.value);
    await newPromotionCode.save();

    return res.status(200).json({
      success: true,
      message: "Create Promotion Code success",
      data: newPromotionCode
    });
  } catch (error) {
    console.error("Create-Promotion-Code-error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot create Promotion Code",
    });
  }
};
exports.GetPromotionCodeByCompany = async (req, res) => {
  try {
    const { id } = req.decodedData;

    const company = await Company.findOne({
      companyId: id,
    });

    if (company.banStatus) {
      return res.status(400).json({
        error: true,
        message: "Cannot get data,company had ban",
      });
    }

    const promotionCode = await PromotionCode.find({ company });

    return res.status(200).json({
      success: true,
      data: promotionCode,
      message: "get promotion code success",
    });
  } catch (error) {
    console.error("get promotion code error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot get promotion code error ",
    });
  }
};
exports.ValidatePromotionCodeById = async (req, res) => {
  try {
    const { promotionCodeId ,companyId} = req.body;

    const promotionCode = await PromotionCode.findOne({
      promotionCodeId,companyId,
    });

    if (!promotionCode) {
      return res.status(400).json({
        error: true,
        message: "this code invalid",
      });
    }
    if(promotionCode.quantity <= promotionCode.used){
      return res.status(400).json({
        error: true,
        message: "this code used",
      });
    }
    return res.status(200).json({
      success: true,
      data: promotionCode,
      message: "get promotion code success",
    });
  } catch (error) {
    console.error("get promotion code error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot promotion code contract error ",
    });
  }
};
exports.UsePromotionCodeById = async (req, res) => {
  try {
    const { promotionCodeId, companyId } = req.body;

    const promotionCode = await PromotionCode.findOne({
      companyId,
      promotionCodeId,
    });

    if (!promotionCode) {
      return res.status(400).json({
        error: true,
        message: "this code invalid",
      });
    }

    if (promotionCode.used < promotionCode.quantity) {
      promotionCode.used++;
      await promotionCode.save();
      return res.status(200).json({
        success: true,
        data: promotionCode,
        message: "get promotion code success",
      });
    }
    return res.status(400).json({
      error: true,
      message: "code out of quantity",
    });
  } catch (error) {
    console.error("get promotion code error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot promotion code contract error ",
    });
  }
};
exports.SendPromotionCodeToUser = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const {address, promotionCodeId } = req.body;

    const promotionCode = await PromotionCode.findOne({
      companyId:id,
      promotionCodeId,
    });
    const company = await Company.findOne({
      companyId:id,
    });
    const user = await Users.findOne({
      address
    });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: "address not found",
      });
    }

    if (!promotionCode) {
      return res.status(400).json({
        error: true,
        message: "this code invalid",
      });
    }

    if (promotionCode.used < promotionCode.quantity) {
      await sendPromotionCodeEmail(user.email,promotionCode.promotionCodeId,promotionCode.description,company.companyName);
      return res.status(200).json({
        success: true,
        message: "send promotion code success",
      });
    }

    return res.status(400).json({
      error: true,
      message: "code out of quantity",
    });
  } catch (error) {
    console.error("get promotion code error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot promotion code contract error ",
    });
  }
};
