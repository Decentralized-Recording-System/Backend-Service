const express = require("express");
const router = express.Router();
const ModelContractController = require("../controllers/model-contract/model-contract.controller");
const verifyAuth = require("../middle-wares/validateToken");
const cleanBody = require("../middle-wares/clean-body");

// for ModelContractController
router.get("/:id", verifyAuth, ModelContractController.GetModelContractById);
router.post("/create", verifyAuth, ModelContractController.CreateModelContract);
router.get("/companies", cleanBody, ModelContractController.GetCompanies);
router.post("/companies/:id",verifyAuth,ModelContractController.GetModelContractByCompany);

module.exports = router;
