const ethers = require('ethers');
require("dotenv").config();

const url = process.env.RPC_ENDPOINT;
const mnemonic = process.env.MNEMONIC;
const adminProvider = () => {
    try {
        const wallet = ethers.Wallet.fromMnemonic(mnemonic);
        const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
        const walletSigner = wallet.connect(customHttpProvider)

        return { walletSigner }
    }catch(error){
        throw new Error('get provider fail');
    }
}
module.exports = { adminProvider };