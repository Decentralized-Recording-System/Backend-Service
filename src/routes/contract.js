const express = require("express");
const router = express.Router();
const CompanyContractController = require("../controllers/contract/company-contract.controller");
const UserContractController = require("../controllers/contract/user-contract.controller");

const verifyAuth = require("../middle-wares/validateToken");
const cleanBody = require("../middle-wares/clean-body");

router.post("/user/create", verifyAuth, UserContractController.CreateContract);

router.post("/user/assent", verifyAuth, UserContractController.AssentContract);

router.post("/user/un-assent", verifyAuth, UserContractController.UnAssentContract);

router.get("/company/:id",verifyAuth,CompanyContractController.getContractByCompany);

router.post("/company/:id", verifyAuth, CompanyContractController.signContract);

router.post("/company/email", verifyAuth, CompanyContractController.SendEmailToUser);

router.get("/:id", verifyAuth, CompanyContractController.getContractById);

module.exports = router;
