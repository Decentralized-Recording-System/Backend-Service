const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contractSchema = new Schema(
	{
		contractId: { type: String, required: true , unique: true},
		companyId: { type: String, required: true, unique: true },
		userId: { type: String, required: true, unique: false }
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
