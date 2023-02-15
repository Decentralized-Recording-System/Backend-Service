const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelContract = new Schema(
	{
		userId: { type: String, required: true , unique: true},
		email: { type: String, required: true, unique: true },
		name: { type: String, required: true, unique: false },
		lastName: { type: String, required: true, unique: false },
		gender: { type: String, required: true },
		dateOfBirth: { type: Date, required: true },
		active: { type: Boolean, required: true, default: false },
		carModel: { type: String, required: true },
		carLicenseNo: { type: String, required: true },
		carChassisNo: { type: String, required: true },
		carModelYr: { type: Number, required: true },
		carBodyType: { type: String, required: true },
		carNoOfSeats: { type: Number, required: true },
		carDisplacement: { type: Number, required: true },
		carGVM: { type: Number, required: true },
		password: { type: String, required: true },
		resetPasswordToken: { type: Number, required: false, default: null },
		resetPasswordExpires: { type: Date, required: false, default: null },
		emailToken: { type: Number, required: false,default: null },
		emailTokenExpires: { type: Date, required: false,default: null },
		accessToken: { type: String, required: false,default: null },
		mnemonic: { type: String, required: false, default: null },
		phone: { type: String, required: false, default: null },
		address: { type: String, required: false, default: null },
		publicKey: { type: String, required: false, default: null },
		macAddress :{ type: String, required: true }
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
