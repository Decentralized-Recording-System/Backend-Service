const express = require("express");
const router = express.Router();
const CompanyContractController = require("../controllers/contract/company-contract.controller");
const UserContractController = require("../controllers/contract/user-contract.controller");

const verifyAuth = require("../middle-wares/validateToken");
const cleanBody = require("../middle-wares/clean-body");


router.post("/user/create", verifyAuth, UserContractController.CreateContract);
router.post("/user/assent/:id", cleanBody, UserContractController.AssentContract);
router.post("/user/un-assent/:id", cleanBody, UserContractController.UnAssentContract);
router.post("/user", verifyAuth, UserContractController.getContracts);
router.get("/user", verifyAuth, UserContractController.getContractByStatus);
router.post("/user/:id", verifyAuth, UserContractController.getContractById);
// full in 22/3

//----------------------------------------------------------------------------------

router.post("/company/email/:id", verifyAuth, CompanyContractController.SendEmailToUser);
router.get("/company/blockchain",verifyAuth,CompanyContractController.getContractFromBlockchain);
router.post("/company/sign/:id", verifyAuth, CompanyContractController.signContract);
router.get("/company",verifyAuth,CompanyContractController.getContractByStatus);
router.get("/company/:id",verifyAuth,CompanyContractController.getContractByCompany);
router.get("/:id", verifyAuth, CompanyContractController.getContractById);
// full in 22/3

module.exports = router;
