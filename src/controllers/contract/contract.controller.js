const bcrypt = require('bcryptjs');
require('dotenv').config();
const { v4: uuid } = require('uuid');
const { sendEmail } = require('../../utils/helpers/mailer/otp.mailer');
const { Company } = require('../../models/company/company.model');
const { getUserCredential } = require('../../utils/helpers/getUserCredentials');
const { companySchema } = require('../company/models/register.request')
const { hashPassword } = require('../../utils/helpers/login.service')
const { generateJwt } = require('../../utils/helpers/generateJwt');
const ethers = require('ethers');
const { adminProvider } = require('../../utils/helpers/blockchain/initializeAdminProvider');
const { userProvider } = require('../../utils/helpers/blockchain/initializeUserProvider');
const { CreateContractRequest } = require('./models/create-contract.request');
const { reset } = require('nodemon');
const { Contract } = require('../../models/contract/contract.model');
const { Users } = require('../../models/users/user.model');
const { EmailStatus } = require('../../models/enum/contract.enum');

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
			message: 'Create contract success',
		});
	} catch (error) {
		console.error('Create-contract-error', error);
		return res.status(500).json({
			error: true,
			message: 'Cannot create contract',
		});
	}
}

//----------------------------------------------------//

exports.SendEmailToUser = async (req, res) => {
	try {
		const { id } = req.decodedData;
		const { contractId } = req.body;

		const contract = await Contract.findOne({ contractId: contractId })

		const user = await Users.findOne({ userId: contract.userId })

		if (contract.companyId === id) {
			if (contract.emailStatus === EmailStatus.SENT) {
				return res.status(500).json({
					error: true,
					message: "Couldn't send email ,Email has been sent",
				});
			}
			const sendCode = await sendEmail(user.email, contract.contractData);
			if (sendCode.error) {
				return res.status(500).json({
					error: true,
					message: "Couldn't send verification email.",
				});
			}
			contract.emailStatus = EmailStatus.SENT;
			await contract.save();
			return res.status(200).json({
				success: true,
				message: 'Sent email Success',
			});
		}
		return res.status(400).json({
			error: true,
			status: 400,
			message: 'Please make a valid request',
		});

	} catch (error) {
		console.error('Create-contract-error', error);
		return res.status(500).json({
			error: true,
			message: 'Cannot create contract',
		});
	}

}