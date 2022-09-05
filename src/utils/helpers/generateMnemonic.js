const { Wallet } = require('ethers');

function generateMnemonic() {
	try {
		const mnemonic = Wallet.createRandom().mnemonic.phrase;
		return { error: false, mnemonic };
	} catch (error) {
		return { error: true };
	}
}

module.exports = { generateMnemonic };
