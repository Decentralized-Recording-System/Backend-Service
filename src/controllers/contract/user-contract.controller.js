require("dotenv").config();
const { v4: uuid } = require("uuid");
const { Company } = require("../../models/company/company.model");
const { Contract } = require("../../models/contract/contract.model");
const { Users } = require("../../models/users/user.model");
const {
  EmailStatus,
  ContractStatus,
} = require("../../models/enum/contract.enum");
const {
  sendCreateContractEmail,
} = require("../../utils/helpers/mailer/create-contract.mailer");
const {
  CreateContractRequest,
  SendEmailToUserRequest,
  signContractRequest,
  GetContractById,
  AssentContractRequest,
} = require("./dto");

//----------------------------------------------------//

exports.CreateContract = async (req, res) => {
  try {
    const { id } = req.decodedData;

    const company = await Company.findOne({ companyId: id });

    const result = CreateContractRequest.validate(req.body);

    if (result.error) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: result.error.message,
      });
    }

    const contractId = uuid();
    result.value.contractId = contractId;
    result.value.companyId = company.companyId;

    const newContract = new Contract(result.value);
    await newContract.save();

    return res.status(200).json({
      success: true,
      message: "Create contract success",
    });
  } catch (error) {
    console.error("Create-contract-error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot create contract",
    });
  }
};

//----------------------------------------------------//

exports.AssentContract = async (req, res) => {
  try {
    const { id } = req.decodedData();

    const result = AssentContractRequest.validate(req.bod);

    if (!result.value.singName) {
      return res.status(400).json({
        error: true,
        message: "don't have name sing",
      });
    }

    const contract = await Contract.findOne({
      contractId: result.value.contractId,
      userId: id,
    });
    contract.userStatus = ContractStatus.ACTIVE;

    await contract.save();
    return res.status(200).json({
      success: true,
      message: "assent contract success",
    });
  } catch (error) {
    console.error("Sent email error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot assent contract",
    });
  }
};
//----------------------------------------------------//

exports.UnAssentContract = async (req, res) => {
  try {
    const { id } = req.decodedData();

    const result = AssentContractRequest.validate(req.bod);

    if (!result.value.singName) {
      return res.status(400).json({
        error: true,
        message: "don't have name sing",
      });
    }

    const contract = await Contract.findOne({
      contractId: result.value.contractId,
      userId: id,
    });
    contract.userStatus = ContractStatus.UN_ASSENT;

    await contract.save();
    return res.status(200).json({
      success: true,
      message: "un assent contract success",
    });
  } catch (error) {
    console.error("Sent email error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot un assent contract",
    });
  }
};
