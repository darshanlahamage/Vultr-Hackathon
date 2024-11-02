import express from 'express';
import { requestOTP, verifyOTPAndRegister, verifyKYC } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register/request-otp', requestOTP);
router.post('/register/verify-otp', verifyOTPAndRegister);
router.post('/kyc/verify', verifyKYC);

export default router;
