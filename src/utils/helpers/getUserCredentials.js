const ethers = require('ethers');

const getUserCredential = (mnemonic) => {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  const { address, privateKey, publicKey } = wallet;

  return { address, privateKey, publicKey };
}

module.exports = { getUserCredential };