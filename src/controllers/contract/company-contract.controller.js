require("dotenv").config();

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
  userProvider,
} = require("../../utils/helpers/blockchain/initializeUserProvider");
const { ethers } = require("ethers");
const INSURANCE_CONTRACT = require("../../utils/helpers/blockchain/abi/INSURANCE_CONTRACT.json");

//----------------------------------------------------//
exports.SendEmailToUser = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const contractId = req.params.id;
    const contract = await Contract.findOne(
      { contractId: contractId },
      {
        carId: 1,
        companyId: 1,
        contractData: 1,
        contractId: 1,
        contractType: 1,
        contractValue: 1,
        promotionCodeId: 1,
        userId: 1,
      }
    );
    const user = await Users.findOne({ userId: contract.userId });
    const company = await Company.findOne({ companyId: id });

    if (!company || !contract || !user || company.banStatus) {
      return res.status(400).json({
        error: true,
        message: "Couldn't send email ,Email has been sent,not found",
      });
    }

    if (contract.companyId === id) {
      if (contract.emailStatus === EmailStatus.SENT) {
        return res.status(500).json({
          error: true,
          message: "Couldn't send email ,Email has been sent",
        });
      }

      const sendCodeStatus = await sendCreateContractEmail(user.email, {
        contract,
        company: company.companyName,
      });

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
    const contractId = req.params.id;
    const contract = await Contract.findOne({ contractId: contractId });
    const company = await Company.findOne({ companyId: id });

    if (!company || company.banStatus) {
      return res.status(400).json({
        error: true,
        message: "company not found",
      });
    }

    if (contract.companyId === id) {
      // for sign in blockchain
      const contractAddress = process.env.INSURANCE_CONTRACT_ADDRESS;

      const { walletSigner } = userProvider(company.mnemonic);

      const contractStoreDate = new ethers.Contract(
        contractAddress,
        INSURANCE_CONTRACT,
        walletSigner
      );

      // save data
      const body = {
        user: contract.userId,
        company: contract.companyId,
        contractValue: contract.contractValue,
        contractData: contract.contractData,
        start: contract.start.toISOString(),
        expire: contract.expire.toISOString(),
      };

      const result = await contractStoreDate.createContract(body);

      if (!result) {
        return res.status(400).json({
          error: true,
          status: 400,
          message: "contract error",
        });
      }
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

//---------------------get Contract By Company-------------------------------//

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

//-------------------------get Contract By Id---------------------------//

exports.getContractById = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const contractId = req.params.id;

    const company = await Company.findOne({ companyId: id });

    if (company.banStatus) {
      return res.status(400).json({
        error: true,
        message: "Cannot get data,you had ban",
      });
    }

    const contract = await Contract.findOne({
      contractId,
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

//-------------------------get Contract from blockchain---------------------------//

exports.getContractFromBlockchain = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const company = await Company.findOne({ companyId: id });

    if (company.banStatus) {
      return res.status(400).json({
        error: true,
        message: "Cannot get data,you had ban",
      });
    }

    const contractAddress = process.env.INSURANCE_CONTRACT_ADDRESS;

    const { walletSigner } = userProvider(company.mnemonic);

    const contractStoreDate = new ethers.Contract(
      contractAddress,
      INSURANCE_CONTRACT,
      walletSigner
    );

    const result = await contractStoreDate.getAllContract();

    if (!result) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: "contract error",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
      message: "get Contract Success",
    });
  } catch (error) {
    console.error("get contract error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot get contract ",
    });
  }
};
