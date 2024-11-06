import express from 'express';
import userRoutes from './routes/user.routes.js';
import loanRoutes from './routes/loan.routes.js';
import bidRoutes from './routes/bid.routes.js'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/bids', bidRoutes);

export default app;