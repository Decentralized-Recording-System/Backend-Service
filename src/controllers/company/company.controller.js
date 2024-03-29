const bcrypt = require("bcryptjs");
require("dotenv").config();
const { v4: uuid } = require("uuid");
const { sendEmail } = require("../../utils/helpers/mailer/otp.mailer");
const { generateMnemonic } = require("../../utils/helpers/generateMnemonic");
const { Company } = require("../../models/company/company.model");
const { Contract } = require("../../models/contract/contract.model");
const { Users } = require("../../models/users/user.model");
const { getUserCredential } = require("../../utils/helpers/getUserCredentials");
const { companySchema } = require("../company/dto/register.request");
const { hashPassword } = require("../../utils/helpers/login.service");
const { generateJwt } = require("../../utils/helpers/generateJwt");
const ethers = require("ethers");
const {
  adminProvider,
} = require("../../utils/helpers/blockchain/initializeAdminProvider");
const DRS_DATA_STORE = require("../../utils/helpers/blockchain/abi/DRS_DATA_STORE.json");
const INSURANCE_CONTRACT = require("../../utils/helpers/blockchain/abi/INSURANCE_CONTRACT.json");

const {
  userProvider,
} = require("../../utils/helpers/blockchain/initializeUserProvider");

exports.Register = async (req, res) => {
  try {
    const result = companySchema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: result.error.message,
      });
    }
    const company = await Company.findOne({
      email: result.value.email,
    });
    if (company) {
      return res.status(400).json({
        error: true,
        message: "Email is already in use",
      });
    }

    const hash = await hashPassword(result.value.password);
    const id = uuid(); //Generate unique id for the company.
    result.value.companyId = id;
    //remove the confirmPassword field from the result as we dont need to save this in the db.
    delete result.value.confirmPassword;
    result.value.password = hash;
    let code = Math.floor(100000 + Math.random() * 900000); //Generate random 6 digit code.
    let expiry = Date.now() + 60 * 1000 * 15; //Set expiry 15 mins ahead from now
    const sendCode = await sendEmail(result.value.email, code);
    if (sendCode.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send verification email.",
      });
    }
    result.value.emailToken = code;
    result.value.emailTokenExpires = new Date(expiry);
    // Generate new Mnemonic for company
    const { mnemonic: generatedMnemonic } = generateMnemonic();
    result.value.mnemonic = generatedMnemonic;
    // create publicKey and address
    const { publicKey, address } = getUserCredential(generatedMnemonic);
    result.value.publicKey = publicKey;
    result.value.address = address;

    const newUser = new Company(result.value);
    await newUser.save();
    return res.status(200).json({
      success: true,
      message: "Registration Success",
    });
  } catch (error) {
    console.error("Registration-error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot Register",
    });
  }
};
exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Cannot authorize company.",
      });
    }
    //1. Find if any account with that email exists in DB
    const company = await Company.findOne({ email: email });
    // NOT FOUND - Throw error
    if (!company) {
      return res.status(404).json({
        error: true,
        message: "Account not found",
      });
    }
    //2. Throw error if account is not activated
    if (!company.active) {
      return res.status(400).json({
        error: true,
        message: "You must verify your email to activate your account",
      });
    }
    //3. Verify the password is valid
    //const isValid = await User.comparePasswords(password, company.password);
    const isValid = await bcrypt.compare(password, company.password);
    if (!isValid) {
      return res.status(400).json({
        error: true,
        message: "Invalid credentials",
      });
    }
    /************************************************************************/
    //Generate Access token
    const { error, token } = await generateJwt(
      company.email,
      company.companyId
    );
    if (error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't create access token. Please try again later",
      });
    }
    company.accessToken = token;
    company.email = email;
    await company.save();
    return res.status(200).json({
      success: true,
      email: email,
      message: "User logged in successfully",
      accessToken: token, //Send it to the client
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({
      error: true,
      message: "Couldn't login. Please try again later.",
    });
  }
};
exports.Activate = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!(email && code)) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: "Please make a valid request",
      });
    }
    const company = await Company.findOne({
      email: email,
      emailToken: code,
      emailTokenExpires: { $gt: Date.now() }, // check if the code is expired
    });
    if (!company) {
      return res.status(400).json({
        error: true,
        message: "Invalid details, company not found",
      });
    } else {
      if (company.active)
        return res.status(400).json({
          error: true,
          message: "Account already activated",
          status: 400,
        });

      // interact blockchain add address

      const contractAddress = process.env.DRS_CONTRACT_ADDRESS;
      const { walletSigner } = adminProvider();
      const contract = new ethers.Contract(
        contractAddress,
        DRS_DATA_STORE,
        walletSigner
      );
      const insuranceContractAddress = process.env.INSURANCE_CONTRACT_ADDRESS;
      const InsuranceContract = new ethers.Contract(
        insuranceContractAddress,
        INSURANCE_CONTRACT,
        walletSigner
      );

      await contract.addCompanyAddress(company.address);
      await InsuranceContract.addCompanyAddress(company.address);

      //save
      company.active = true;

      await company.save();

      return res.status(200).json({
        success: true,
        message: "Account activated.",
      });
    }
  } catch (error) {
    console.error("activation-error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
exports.ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "Cannot be processed",
      });
    }

    const company = await Company.findOne({
      email: email,
    });

    if (!company) {
      return res.status(200).json({
        success: true,
        message:
          "If that email address is in our database, we will send you an email to reset your password",
      });
    }

    let code = Math.floor(100000 + Math.random() * 900000);
    let response = await sendEmail(company.email, code);

    if (response.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send mail. Please try again later.",
      });
    }

    let expiry = new Date(Date.now() + 60 * 1000 * 15);

    company.resetPasswordToken = code;
    company.resetPasswordExpires = expiry; // 15 minutes

    await company.save();

    return res.status(200).json({
      success: true,
      message:
        "If that email address is in our database, we will send you an email to reset your password",
    });
  } catch (error) {
    console.error("forgot-password-error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
exports.ResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) {
      return res.status(403).json({
        error: true,
        message:
          "Couldn't process request. Please provide all mandatory fields",
      });
    }
    const company = await Company.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!company) {
      return res.status(400).json({
        error: true,
        message: "Password reset token is invalid or has expired.",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: true,
        message: "Passwords didn't match",
      });
    }
    const hash = await hashPassword(req.body.newPassword);
    company.password = hash;
    company.resetPasswordToken = null;
    company.resetPasswordExpires = null;
    await company.save();
    return res.status(200).json({
      success: true,
      message: "Password has been changed",
    });
  } catch (error) {
    console.error("reset-password-error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
exports.ReActivate = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "Cannot be processed",
      });
    }
    const company = await Company.findOne({
      email: email,
    });
    if (!company) {
      return res.status(200).json({
        success: true,
        message:
          "If that email address is in our database, we will send you an email to reset your password",
      });
    }
    let code = Math.floor(100000 + Math.random() * 900000);
    let response = await sendEmail(company.email, code);
    if (response.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send mail. Please try again later.",
      });
    }
    let expiry = new Date(Date.now() + 60 * 1000 * 15);
    company.emailToken = code;
    company.emailTokenExpires = expiry; // 15 minutes
    await company.save();
    return res.status(200).json({
      success: true,
      message: "You must verify your email to activate your account",
    });
  } catch (error) {
    console.error("activate-email-error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
exports.Logout = async (req, res) => {
  try {
    const { id } = req.decodedData;
    let company = await Company.findOne({ companyId: id });

    if (!company) {
      return res.status(400).json({
        error: true,
        message: "Email not found",
      });
    }

    company.accessToken = "";
    await company.save();
    return res.status(200).json({ success: true, message: "User Logged out" });
  } catch (error) {
    console.error("company logout error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
exports.CheckAccessToken = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: "you are in" });
  } catch (error) {
    console.error("you are not in", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
exports.GetCompanyData = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const company = await Company.findOne(
      { companyId: id },
      { userId: 1, Name: 1, email: 1 }
    );

    if (!company) {
      return res.status(400).json({
        error: true,
        message: "Email not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get company data success",
      data: company,
    });
  } catch (error) {
    console.error("cannot get data ", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
exports.GetUsersTinyData = async (req, res) => {
  try {
    const { id } = req.decodedData;

    const company = await Company.findOne({ companyId: id});

    if (!company) {
      return res.status(400).json({
        error: true,
        message: "not found company",
      });
    }

    let contractAddress = process.env.DRS_CONTRACT_ADDRESS;

    const { walletSigner } = userProvider(company.mnemonic);

    let contract = new ethers.Contract(
      contractAddress,
      DRS_DATA_STORE,
      walletSigner
    );

    const result = await contract.companyGetUsers();

    const response = result.map((item) => ({
      address: item.user,
      updateCount: parseInt(item.updateCount._hex),
      lastScore: parseInt(item.lastScore._hex),
      lastDate: item.lastUpdate,
    }));

const data = await Contract.find({ companyId: id }, { userId: 1, _id: 0 });

const allUsers = await Users.find({}, { address: 1, userId: 1 });

const notMy = allUsers.filter(user => !data.some(contract => contract.userId === user.userId));

const notMyUser = response.filter(user => notMy.some(notMyUser => notMyUser.address === user.address));

return res.status(200).json(notMyUser);

  } catch (error) {
    console.error("cannot get data ", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
exports.GetUserDrivingData = async (req, res) => {
  try {
    const address = req.params.id;

    const { id } = req.decodedData;

    const company = await Company.findOne({ companyId: id });

    if (!company) {
      return res.status(400).json({
        error: true,
        message: "Email not found",
      });
    }

    const contractAddress = process.env.DRS_CONTRACT_ADDRESS;

    const { walletSigner } = userProvider(company.mnemonic);

    let contract = new ethers.Contract(
      contractAddress,
      DRS_DATA_STORE,
      walletSigner
    );
    console.log({address});

    const result = await contract.companyGetUserDrivingData(address);

    const response = result.map((item) => ({
      braking: parseInt(item.braking._hex),
      dangerousBrake: parseInt(item.dangerousBrake._hex),
      dangerousTurn: parseInt(item.dangerousTurn._hex),
      dangerousSpeed: parseInt(item.dangerousSpeed._hex),
      averageSpeed: item.averageSpeed,
      drivingTime: parseInt(item.drivingTime._hex),
      date: item.date,
      score: parseInt(item.score._hex),
    }));

    return res.status(200).json(response);
  } catch (error) {
    console.error("cannot get data ", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
exports.GetMyUsers = async (req, res) => {
  try {
    const { id } = req.decodedData;

    const company = await Company.findOne({ companyId: id });

    if (!company) {
      return res.status(400).json({
        error: true,
        message: "Email not found",
      });
    }

    const data = await Contract.find({companyId:id});

    const allUsers = await Users.find({}, { address: 1, userId: 1 });

    const MyUser = allUsers.filter(user => data.some(contract => contract.userId === user.userId));

    const promises = data.map(item => ({ data: item, address: MyUser.filter(i => i.userId === item.userId)[0].address }));

    return res.status(200).json(promises);
  } catch (error) {
    console.error("cannot get data ", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

exports.GetNotMyUsers = async (req, res) => {
  try {
    const { id } = req.decodedData;

    const company = await Company.findOne({ companyId: id });

    if (!company) {
      return res.status(400).json({
        error: true,
        message: "Email not found",
      });
    }

    const data = await Contract.find({companyId:company.companyId},{userId:1});

    return res.status(200).json(data);
  } catch (error) {
    console.error("cannot get data ", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
