const bcrypt = require("bcryptjs");
require("dotenv").config();
const { v4: uuid } = require("uuid");
const { sendEmail } = require("../../utils/helpers/mailer/otp.mailer");
const { generateMnemonic } = require("../../utils/helpers/generateMnemonic");
const { Users } = require("./../../models/users/user.model");
const { getUserCredential } = require("../../utils/helpers/getUserCredentials");
const { userSchema } = require("../users/dto/register.request");
const { hashPassword } = require("../../utils/helpers/login.service");
const { generateJwt } = require("../../utils/helpers/generateJwt");
const {
  adminProvider,
} = require("../../utils/helpers/blockchain/initializeAdminProvider");
const ethers = require("ethers");
const DRS_DATA_STORE = require("../../utils/helpers/blockchain/abi/DRS_DATA_STORE.json");
const {
  userProvider,
} = require("../../utils/helpers/blockchain/initializeUserProvider");

// ------------------------------------------------- Register --------------------------------------------------------

exports.Register = async (req, res) => {
  try {
    const result = userSchema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        error: true,
        status: 400,
        message: result.error.message,
      });
    }
    const user = await Users.findOne({
      email: result.value.email,
    });
    if (user) {
      return res.status(400).json({
        error: true,
        message: "Email is already in use",
      });
    }

    const hash = await hashPassword(result.value.password);
    const id = uuid(); //Generate unique id for the user.
    result.value.userId = id;
    //remove the confirmPassword field from the result as we don,t need to save this in the db.
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
    // Generate new Mnemonic for user
    const { mnemonic: generatedMnemonic } = generateMnemonic();
    result.value.mnemonic = generatedMnemonic;
    // create publicKey and address
    const { publicKey, address } = getUserCredential(generatedMnemonic);
    result.value.publicKey = publicKey;
    result.value.address = address;

    const newUser = new Users(result.value);
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

// ------------------------------------------------- login --------------------------------------------------------

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Cannot authorize user.",
      });
    }
    //1. Find if any account with that email exists in DB
    const user = await Users.findOne({ email: email });
    // NOT FOUND - Throw error
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "Account not found",
      });
    }
    //2. Throw error if account is not activated
    if (!user.active) {
      return res.status(400).json({
        error: true,
        message: "You must verify your email to activate your account",
      });
    }
    //3. Verify the password is valid
    //const isValid = await User.comparePasswords(password, user.password);
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({
        error: true,
        message: "Invalid credentials",
      });
    }
    /************************************************************************/
    //Generate Access token
    const { error, token } = await generateJwt(user.email, user.userId);
    if (error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't create access token. Please try again later",
      });
    }
    user.accessToken = token;
    user.email = email;
    await user.save();
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

// ------------------------------------------------- ActivateUser --------------------------------------------------------

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
    const user = await Users.findOne({
      email: email,
      emailToken: code,
      emailTokenExpires: { $gt: Date.now() }, // check if the code is expired
    });
    if (!user) {
      return res.status(400).json({
        error: true,
        message: "Invalid details, user not found",
      });
    } else {
      if (user.active)
        return res.status(400).json({
          error: true,
          message: "Account already activated",
          status: 400,
        });
      // interact blockchain add address

      let contractAddress = process.env.DRS_CONTRACT_ADDRESS;
      const { walletSigner } = adminProvider();
      let contract = new ethers.Contract(
        contractAddress,
        DRS_DATA_STORE,
        walletSigner
      );
      await contract.AddUserAddress(user.address);

      // save address
      user.active = true;
      await user.save();
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

// ------------------------------------------------- ForgotPassword --------------------------------------------------------

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
    const user = await Users.findOne({
      email: email,
    });
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If that email address is in our database, we will send you an email to reset your password",
      });
    }
    let code = Math.floor(100000 + Math.random() * 900000);
    let response = await sendEmail(user.email, code);
    if (response.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send mail. Please try again later.",
      });
    }
    let expiry = new Date(Date.now() + 60 * 1000 * 15);
    user.resetPasswordToken = code;
    user.resetPasswordExpires = expiry; // 15 minutes
    await user.save();
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

// ------------------------------------------------- ResetPassword --------------------------------------------------------

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
    const user = await Users.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
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
    user.password = hash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
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

// ------------------------------------------------- ReActivate --------------------------------------------------------

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
    const user = await Users.findOne({
      email: email,
    });
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If that email address is in our database, we will send you an email to reset your password",
      });
    }
    let code = Math.floor(100000 + Math.random() * 900000);
    let response = await sendEmail(user.email, code);
    if (response.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send mail. Please try again later.",
      });
    }
    let expiry = new Date(Date.now() + 60 * 1000 * 15);
    user.emailToken = code;
    user.emailTokenExpires = expiry; // 15 minutes
    await user.save();
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

// ------------------------------------------------- Logout --------------------------------------------------------

exports.Logout = async (req, res) => {
  try {
    const { id } = req.decodedData;
    let user = await Users.findOne({ userId: id });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: "user not found",
      });
    }

    user.accessToken = "";
    await user.save();
    return res.status(200).json({ success: true, message: "User Logged out" });
  } catch (error) {
    console.error("user logout error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// ------------------------------------------------- check accessToken--------------------------------------------------------

exports.CheckAccessToken = async (req, res) => {
  try {
    const { id } = req.decodedData;
    return res.status(200).json({ success: true, message: "you are in" });
  } catch (error) {
    console.error("you are not in", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// ------------------------------------------------- get user data--------------------------------------------------------

exports.GetUserData = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const user = await Users.findOne(
      {
        userId: id,
      },
      {
        address: 1,
        carBodyType: 1,
        carChassisNo: 1,
        carDisplacement: 1,
        carGVM: 1,
        email: 1,
        carLicenseNo: 1,
        carModel: 1,
        carModelYr: 1,
        carNoOfSeats: 1,
        dateOfBirth: 1,
        gender: 1,
        name: 1,
        lastName: 1,
        phone: 1,
        _id: 0,
      }
    );

    if (!user) {
      return res.status(400).json({
        error: true,
        message: "user not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get user data success",
      data: user,
    });
  } catch (error) {
    console.error("cannot get data ", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// ------------------------------------------------- Add Driving Data--------------------------------------------------------

exports.AddDrivingData = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const user = await Users.findOne({ userId: id });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: "user not found",
      });
    }

    const { data } = req.body;

    let contractAddress = process.env.DRS_CONTRACT_ADDRESS;

    const { walletSigner } = userProvider(user.mnemonic);

    let contract = new ethers.Contract(
      contractAddress,
      DRS_DATA_STORE,
      walletSigner
    );

    const result = await contract.AddUserDrivingData(data);

    return res.status(200).json({
      success: true,
      message: "Add user data success",
      data: result,
    });

  } catch (error) {
    console.error("cannot get data ", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// ------------------------------------------------- Add Driving Data--------------------------------------------------------

exports.GetDrivingData = async (req, res) => {
  try {
    const { id } = req.decodedData;
    const user = await Users.findOne({ userId: id });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: "user not found",
      });
    }

    let contractAddress = process.env.DRS_CONTRACT_ADDRESS;

    const { walletSigner } = userProvider(user.mnemonic);

    let contract = new ethers.Contract(
      contractAddress,
      DRS_DATA_STORE,
      walletSigner
    );

    const result = await contract.GetUserDrivingData();

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

    return res.status(200).json({
      success: true,
      message: "Get user data success",
      data: response,
    });

  } catch (error) {
    console.error("cannot get data ", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
