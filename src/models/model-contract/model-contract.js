const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelContract = new Schema(
	{
		modelContractId: { type: String, required: true },
		modelContractName: { type: String, required: true },
		companyId: { type: String, required: true },
		data: [Schema.Types.Mixed]
	},
	{
		timestamps: {
			createdAt: 'createdAt',
			updatedAt: 'updatedAt',
		},
	}
);
const ModelContract = mongoose.model('model-contract', modelContract);
module.exports = { ModelContract };
