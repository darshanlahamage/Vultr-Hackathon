import express from 'express';
import { createBid, acceptBid, getAllBidsByUser } from '../controllers/bid.controller.js';

const router = express.Router();

router.post('/create', createBid);
router.post('/accept', acceptBid);
router.get('/user/:user_id', getAllBidsByUser);

export default router;
