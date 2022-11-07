const ethers = require('ethers');
require("dotenv").config();
const url = process.env.RPC_ENDPOINT;
const mnemonic = process.env.MNEMONIC;
const adminProvider = () => {
    try {
        const wallet = new ethers.Wallet.fromMnemonic(mnemonic);
        const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
        const walletSigner = wallet.connect(customHttpProvider)
        console.log("mnemonic",mnemonic);
        console.log("url",url);
        return { walletSigner }
    }catch{
        throw new Error('get provider fail', error);
    }
}
module.exports = { adminProvider };