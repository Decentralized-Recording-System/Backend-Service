const express = require("express");
const router = express.Router();
const ModelContractController = require("../controllers/model-contract/model-contract.controller");

const verifyAuth = require("../middle-wares/validateToken");
const cleanBody = require("../middle-wares/clean-body");

// for company
router.post("/company/create", verifyAuth, ModelContractController.CreateModelContract);
router.get("/company", verifyAuth, ModelContractController.GetModelContractByOwnCompany);
router.get("/company/:id", verifyAuth, ModelContractController.GetModelContractByOwnCompanyId);
// for user
router.get("/user/company", verifyAuth, ModelContractController.GetCompanies);
router.get("/user/company/:id",verifyAuth,ModelContractController.GetModelContractByCompany);
router.get("/user/:id", verifyAuth, ModelContractController.GetModelContractById);
//full in 22/3

module.exports = router;
