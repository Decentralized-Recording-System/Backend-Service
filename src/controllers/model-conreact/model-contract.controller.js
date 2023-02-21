require("dotenv").config();
const { v4: uuid } = require("uuid");
const { Company } = require("../../models/company/company.model");
const { Contract } = require("../../models/contract/contract.model");
const {
  CreateModelContractRequest,
} = require("./models/create-model-contract.request");
const { ModelContract } = require("../../models/model-contract/model-contract");
const {
  getModelContractById,
  GetModelContractByCompanyRequest,
} = require("./models");
const { getContractByCompany } = require("../contract/contract.controller");

//----------------------------------------------------//

exports.CreateModelContract = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const company = await Company.findOne({ companyId: id });

    const result = CreateModelContractRequest.validate(req.body);

    if (result.error) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: result.error.message,
      });
    }

    const modelContractId = uuid();
    result.value.modelContractId = modelContractId;
    result.value.companyId = company.companyId;

    const newModelContract = new Contract(result.value);
    await newModelContract.save();

    return res.status(200).json({
      success: true,
      message: "Create model contract success",
    });
  } catch (error) {
    console.error("Create model contract error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot model create contract error ",
    });
  }
};

exports.GetCompanies = async (req, res) => {
  try {
    const companies = await Company.find(
      { banStatus: false },
      { companyName: 1, companyId: 1 }
    );

    return res.status(200).json({
      success: true,
      data: companies,
      message: "get companies success",
    });
  } catch (error) {
    console.error("get companies error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot get companies error ",
    });
  }
};

exports.GetModelContractByCompany = async (req, res) => {
  try {
    const result = GetModelContractByCompanyRequest.validate(req.body);
    const company = await Company.findOne({
      companyId: result.value.companyId,
    });

    if (company.banStatus) {
      return res.status(400).json({
        error: true,
        message: "Cannot get data,company had ban",
      });
    }

    const Models = await ModelContract.find(
      { company },
      { modelContractName: 1 }
    );

    return res.status(200).json({
      success: true,
      data: Models,
      message: "get model contract success",
    });
  } catch (error) {
    console.error("get model contract error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot get model  contract error ",
    });
  }
};

exports.GetModelContractById = async (req, res) => {
  try {
    const result = getModelContractById.validate(req.body);
    const company = await Company.findOne({
      companyId: result.value.companyId,
    });

    if (company.banStatus) {
      return res.status(400).json({
        error: true,
        message: "Cannot get data,you had ban",
      });
    }

    const Models = await ModelContract.findOne({
      companyId: result.value.companyId,
      modelContractId: result.value.modelContractId,
    });

    return res.status(200).json({
      success: true,
      data: Models,
      message: "get model contract success",
    });
  } catch (error) {
    console.error("get model contract error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot get model  contract error ",
    });
  }
};
