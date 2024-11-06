import express from 'express';
import { requestOTP, verifyOTPAndRegister, verifyKYC, verifyOTPAndLogin, getUserDetails } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register/request-otp', requestOTP);
router.post('/register/verify-otp', verifyOTPAndRegister);
router.post('/login/request-otp', requestOTP);
router.post('/login/request-otp', verifyOTPAndLogin);
router.get('/:user_id', getUserDetails);
router.post('/kyc/verify', verifyKYC);

export default router;
