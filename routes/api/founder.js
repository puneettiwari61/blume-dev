var express = require("express");
const { mailSender } = require("../../modules/mailSender");
const {
  sendOTP,
  verifyOTP,
  getCurrentUser,
  connectMessage,
  searchConnections,
} = require("../../controllers/founderController");
const auth = require("../../modules/auth");

var router = express.Router();

router.post("/send-email-otp", sendOTP);

// Define a route for verifying OTP and creating password
router.post("/verify-otp", verifyOTP);

router.get("/me", auth.verifyToken, getCurrentUser);

router.post("/connect", auth.verifyToken, connectMessage);

router.get("/search", auth.verifyToken, searchConnections);

module.exports = router;
