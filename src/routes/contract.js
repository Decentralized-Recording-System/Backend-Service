const express = require("express");
const router = express.Router();
const ContractController = require("../controllers/contract/contract.controller");
const verifyAuth = require("../middle-wares/validateToken");
const cleanBody = require("../middle-wares/clean-body");

// for ModelContractController
router.get("/:id", cleanBody, ContractController.getContractById);
router.get(
  "/companies/:id",
  verifyAuth,
  ContractController.getContractByCompany
);

router.post("/create", verifyAuth, ContractController.CreateContract);

router.post("/email", verifyAuth, ContractController.SendEmailToUser);

router.post("/:id", verifyAuth, ContractController.signContract);

module.exports = router;
