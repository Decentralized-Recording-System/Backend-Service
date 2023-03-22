const express = require("express");
const router = express.Router();
const ModelContractController = require("../controllers/model-contract/model-contract.controller");

const verifyAuth = require("../middle-wares/validateToken");
const cleanBody = require("../middle-wares/clean-body");

// for company
router.post("/company/create", verifyAuth, ModelContractController.CreateModelContract);

router.get("/company/data", verifyAuth, ModelContractController.GetModelContractByOwnCompany);

router.get("/company", verifyAuth, ModelContractController.GetCompanies);

router.get("/company/:id",verifyAuth,ModelContractController.GetModelContractByCompany);

router.get("/:id", verifyAuth, ModelContractController.GetModelContractById);

//full in 22/3

module.exports = router;
