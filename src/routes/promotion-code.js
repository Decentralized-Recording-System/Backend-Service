const express = require("express");
const router = express.Router();
const promotionCodeController = require("../controllers/promotion-code/promotion-code.controller");
const verifyAuth = require("../middle-wares/validateToken");

router.post("/create", verifyAuth, promotionCodeController.CreatePromotionCode);
router.post("/user", verifyAuth, promotionCodeController.UsePromotionCodeById);
router.post("/validate",verifyAuth,promotionCodeController.ValidatePromotionCodeById);
router.post("/sent", verifyAuth, promotionCodeController.SendPromotionCodeToUser);
router.get("/", verifyAuth, promotionCodeController.GetPromotionCodeByCompany);
// full in 22/3
module.exports = router;
