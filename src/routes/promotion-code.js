const express = require("express");
const router = express.Router();
const promotionCodeController = require("../controllers/promotion-code/promotion-code.controller");
const verifyAuth = require("../middle-wares/validateToken");
const cleanBody = require("../middle-wares/clean-body");

router.post("/create", verifyAuth, promotionCodeController.CreatePromotionCode);
router.get("/", verifyAuth, promotionCodeController.CreatePromotionCode);

module.exports = router;
