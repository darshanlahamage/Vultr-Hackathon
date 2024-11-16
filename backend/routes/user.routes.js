import express from 'express';
import { requestOTP, verifyOTPAndRegister, verifyKYC, userLogin, getUserDetails, aadhaarUpload, reverseAddress } from '../controllers/user.controller.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/register/request-otp', requestOTP);
router.post('/register/verify-otp', verifyOTPAndRegister);
router.post('/login', userLogin);
router.get('/:user_id', getUserDetails);
router.post('/verify-kyc',  upload, verifyKYC);
router.post('/aadhaar-upload',  upload, aadhaarUpload);
router.post("/reverse-address", reverseAddress);


export default router;
