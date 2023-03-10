const express = require("express");
const router = express.Router();
const ModelContractController = require("../controllers/model-contract/model-contract.controller");

const verifyAuth = require("../middle-wares/validateToken");
const cleanBody = require("../middle-wares/clean-body");

// for company
router.post("/company/create", verifyAuth, ModelContractController.CreateModelContract);

router.get("/company", cleanBody, ModelContractController.GetCompanies);

router.get("/company/:id",verifyAuth,ModelContractController.GetModelContractByCompany);

router.get("/:id", verifyAuth, ModelContractController.GetModelContractById);

module.exports = router;
