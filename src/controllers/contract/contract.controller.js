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
} = require("./models");
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

exports.SendEmailToUser = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const { contractId } = req.body;

    SendEmailToUserRequest.validate(req.body);

    const contract = await Contract.findOne({ contractId: contractId });

    const user = await Users.findOne({ userId: contract.userId });

    if (contract.companyId === id) {
      if (contract.emailStatus === EmailStatus.SENT) {
        return res.status(500).json({
          error: true,
          message: "Couldn't send email ,Email has been sent",
        });
      }

      const sendCodeStatus = await sendCreateContractEmail(
        user.email,
        contract.contractData
      );

      if (sendCodeStatus.error) {
        return res.status(500).json({
          error: true,
          message: "Couldn't send contract data  email.",
        });
      }
      contract.emailStatus = EmailStatus.SENT;
      await contract.save();
      return res.status(200).json({
        success: true,
        message: "Sent email Success",
      });
    }
    return res.status(400).json({
      error: true,
      status: 400,
      message: "Please make a valid request or not your contract",
    });
  } catch (error) {
    console.error("Sent email error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot sent email",
    });
  }
};

//----------------------------------------------------//

exports.signContract = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const { contractId } = req.body;
    signContractRequest.validate(req.body);

    const contract = await Contract.findOne({ contractId: contractId });

    if (contract.companyId === id) {
      // for sign in blockchain

      contract.status = ContractStatus.ACTIVE;
      await contract.save();
      return res.status(200).json({
        success: true,
        message: "Sign Contract Success",
      });
    }
    return res.status(400).json({
      error: true,
      status: 400,
      message: "Please make a valid request or not your contract",
    });
  } catch (error) {
    console.error("sign contract error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot sign contract ",
    });
  }
};

//----------------------------------------------------//

exports.getContractByCompany = async (req, res) => {
  try {
    const { id } = req.decodedData;

    const contracts = await Contract.find(
      { companyId: id },
      { contractId: 1, contractType: 1, contractValue: 1 }
    );

    if (contracts) {
      return res.status(200).json({
        success: true,
        data: contracts,
        message: "get Contract Success",
      });
    }

    return res.status(400).json({
      error: true,
      status: 400,
      message: "Please make a valid request or not your contract",
    });
  } catch (error) {
    console.error("get contract error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot get contract ",
    });
  }
};

//----------------------------------------------------//

exports.getContractById = async (req, res) => {
  try {
    const { id } = req.decodedData;

    const company = await Company.findOne({ companyId: id });

    if (company.banStatus) {
      return res.status(400).json({
        error: true,
        message: "Cannot get data,you had ban",
      });
    }

    const result = GetContractById.validate(req.body);

    const contract = await Contract.findOne({
      contractId: result.value.contractId,
      companyId: id,
    });

    if (contract) {
      return res.status(200).json({
        success: true,
        data: contract,
        message: "get Contract Success",
      });
    }

    return res.status(400).json({
      error: true,
      status: 400,
      message: "Please make a valid request or not your contract",
    });
  } catch (error) {
    console.error("get contract error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot get contract ",
    });
  }
};

//----------------------------------------------------//
