const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
	try {
		const salt = await bcrypt.genSalt(10); // 10 rounds
		return await bcrypt.hash(password, salt);
	} catch (error) {
		throw new Error('Hashing failed');
	}
};

module.exports = {hashPassword}