const express = require("express");
const router = express.Router();
const promotionCodeController = require("../controllers/promotion-code/promotion-code.controller");
const verifyAuth = require("../middle-wares/validateToken");
//company
router.post("/create", verifyAuth, promotionCodeController.CreatePromotionCode);
router.get("/", verifyAuth, promotionCodeController.GetPromotionCodeByCompany);
router.post("/sent", verifyAuth, promotionCodeController.SendPromotionCodeToUser);

//user
router.post("/user", verifyAuth, promotionCodeController.UsePromotionCodeById);
router.post("/validate",verifyAuth,promotionCodeController.ValidatePromotionCodeById);
// full in 22/3
module.exports = router;
