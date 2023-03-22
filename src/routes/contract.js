const express = require("express");
const router = express.Router();
const CompanyContractController = require("../controllers/contract/company-contract.controller");
const UserContractController = require("../controllers/contract/user-contract.controller");

const verifyAuth = require("../middle-wares/validateToken");

router.post("/user/create", verifyAuth, UserContractController.CreateContract);
router.post("/user/assent", verifyAuth, UserContractController.AssentContract);
router.post("/user/un-assent", verifyAuth, UserContractController.UnAssentContract);
router.post("/user", verifyAuth, UserContractController.getContracts);
router.post("/user/:id", verifyAuth, UserContractController.getContractById);
// full in 22/3

//----------------------------------------------------------------------------------

router.post("/company/email", verifyAuth, CompanyContractController.SendEmailToUser);
router.get("/company/blockchain",verifyAuth,CompanyContractController.getContractFromBlockchain);
router.post("/company/:id", verifyAuth, CompanyContractController.signContract);
router.get("/company/:id",verifyAuth,CompanyContractController.getContractByCompany);
router.get("/:id", verifyAuth, CompanyContractController.getContractById);
// full in 22/3

module.exports = router;
