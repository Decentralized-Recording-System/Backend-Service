const ethers = require('ethers');
require("dotenv").config();

const url = process.env.RPC_ENDPOINT;
const userProvider = function (mnemonic){
    try {
        const wallet = ethers.Wallet.fromMnemonic(mnemonic);
        const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
        const walletSigner = wallet.connect(customHttpProvider)
        return { walletSigner }

    }catch{
        throw new Error('get provider fail');
    }
}


module.exports = { userProvider };