const bcrypt = require('bcryptjs');
require('dotenv').config();
const { v4: uuid } = require('uuid');
const { sendEmail } = require('../../utils/helpers/mailer/otp.mailer');
const { Company } = require('../../models/company/company.model');;
const ethers = require('ethers');
const { Contract } = require('../../models/contract/contract.model');
const { Users } = require('../../models/users/user.model');
const { EmailStatus } = require('../../models/enum/contract.enum');
const { CreateModelContractRequest } = require('./models/create-model-contract.request');

//----------------------------------------------------//

exports.CreateContract = async (req, res) => {
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
			message: 'Create model contract success',
		});
	} catch (error) {
		console.error('Create model contract error', error);
		return res.status(500).json({
			error: true,
			message: 'Cannot model create contract error ',
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