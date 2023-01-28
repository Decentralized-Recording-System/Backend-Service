const mongoose = require('mongoose');
const { EmailStatus, ContractStatus, ContractType } = require('../enum/contract.enum');
const Schema = mongoose.Schema;

const contractSchema = new Schema(
	{
		contractId: { type: String, required: true, unique: true },
		companyId: { type: String, required: true },
		userId: { type: String, required: true },
		carId: { type: String },
		contractValue: { type: Number , required: true},
		contractType: { type: String,enum:ContractType},
		contractData: { type: String },
		status: { type: String, enum: ContractStatus, required: true, default: ContractStatus.PENDING },
		emailStatus: { type: String, enum: EmailStatus, required: true, default: EmailStatus.NOT_SEND },
	},
	{
		timestamps: {
			createdAt: 'createdAt',
			updatedAt: 'updatedAt',
		},
	}
);
const Contract = mongoose.model('contract', contractSchema);
module.exports = { Contract };
