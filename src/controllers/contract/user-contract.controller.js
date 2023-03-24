require("dotenv").config();
const { v4: uuid } = require("uuid");
const { Contract } = require("../../models/contract/contract.model");
const { Users } = require("../../models/users/user.model");
const {ContractStatus,} = require("../../models/enum/contract.enum");
const {CreateContractRequest,AssentContractRequest,} = require("./dto");

exports.CreateContract = async (req, res) => {
  try {
    const { id } = req.decodedData;

    const user = await Users.findOne({ userId: id });

    if(!user){
      return res.status(400).json({
        error: true,
        status: 400,
        message: 'not found user',
      });
    }

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
    result.value.userId = id;

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
exports.AssentContract = async (req, res) => {
  try {

    const contractId = req.params.id;
    console.log(contractId);
    const contract = await Contract.findOne({
      contractId
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
exports.getContracts = async (req, res) => {
  try {
    const { id } = req.decodedData;

    const contract = await Contract.find({
      userId: id,
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
exports.getContractById = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const contractId = req.params.id

    const contract = await Contract.findOne({
      contractId,
      userId: id,
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
