import express from 'express';
import { requestOTP, verifyOTPAndRegister, verifyKYC, userLogin, getUserDetails, aadhaarUpload } from '../controllers/user.controller.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/register/request-otp', requestOTP);
router.post('/register/verify-otp', verifyOTPAndRegister);
router.post('/login', userLogin);
router.get('/:user_id', getUserDetails);
router.post('/verify-kyc',  upload, verifyKYC);
router.post('/aadhaar-upload',  upload, aadhaarUpload);

export default router;
