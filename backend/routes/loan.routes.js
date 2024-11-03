import express from 'express';
import { createLoan, getUserLoans, getLoanDetails } from '../controllers/loan.controller.js';

const router = express.Router();

router.post('/create', createLoan);
router.get('/user/:user_id', getUserLoans);
router.get('/:loan_id', getLoanDetails);

export default router;
