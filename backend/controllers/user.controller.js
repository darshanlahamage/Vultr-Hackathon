import db from '../config/db.js';
import { generateOTP, verifyOTP } from '../middlewares/otp.js';

// Register User Step 1: Request OTP
export const requestOTP = async (req, res) => {
    const { aadhaar_number } = req.body;

    let connection;

    try {
        connection = await db.getConnection();
        const [results] = await connection.query('SELECT * FROM aadhaar WHERE aadhaar_number = ?', [aadhaar_number]);

        if (results.length === 0) return res.status(404).json({ error: 'Aadhaar not found' });

        const aadhaarData = results[0];
        generateOTP(aadhaarData.phone);

        console.log(`OTP sent to ${aadhaarData.phone}`);
        res.status(200).json({ message: 'OTP sent', aadhaar: aadhaar_number, phone: aadhaarData.phone });

    } catch (err) {
        return res.status(500).json({ error: err.message });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Register User Step 2: Verify OTP and Insert User
export const verifyOTPAndRegister = async (req, res) => {
    const { aadhaar_number, otp, role } = req.body;

    let connection;

    try {
        connection = await db.getConnection();
        const [results] = await connection.query('SELECT * FROM aadhaar WHERE aadhaar_number = ?', [aadhaar_number]);

        if (results.length === 0) return res.status(404).json({ error: 'Aadhaar not found' });

        const aadhaarData = results[0];
        if (!verifyOTP(aadhaarData.phone, otp)) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        const userData = {
            name: aadhaarData.name,
            phone: aadhaarData.phone,
            aadhaar_number,
            role,
            kyc_verified: false,
        };

        const [result] = await db.query('INSERT INTO users SET ?', userData);
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });

    } catch (err) {
        return res.status(500).json({ error: err.message });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Login User: OTP Verification and Fetch User Details
export const verifyOTPAndLogin = async (req, res) => {
    const { aadhaar_number, otp } = req.body;

    let connection;

    try {
        connection = await db.getConnection();
        const [results] = await connection.query('SELECT * FROM aadhaar WHERE aadhaar_number = ?', [aadhaar_number]);

        if (results.length === 0) return res.status(404).json({ error: 'Aadhaar not found' });

        const aadhaarData = results[0];
        if (!verifyOTP(aadhaarData.phone, otp)) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Fetch user details based on aadhaar_number
        const [userResults] = await connection.query('SELECT * FROM users WHERE aadhaar_number = ?', [aadhaar_number]);

        if (userResults.length === 0) {
            return res.status(404).json({ error: 'User not registered' });
        }

        const user = userResults[0];
        res.status(200).json({ message: 'Login successful', user });

    } catch (err) {
        return res.status(500).json({ error: err.message });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Get User Details by user_id
export const getUserDetails = async (req, res) => {
    const { user_id } = req.params;

    let connection;

    try {
        connection = await db.getConnection();
        const [results] = await connection.query('SELECT * FROM users WHERE user_id = ?', [user_id]);

        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = results[0];

        res.status(200).json({ user });

    } catch (err) {
        return res.status(500).json({ error: err.message });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// KYC Verification: Upload and Verify Selfie
export const verifyKYC = async (req, res) => {
    const { userId } = req.body;
    const { photo } = req.file; // Assume photo is uploaded as form-data

    try {
        const [results] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);

        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = results[0];

        // Simulate ML-based photo verification (replace with actual ML verification logic)
        const isPhotoMatch = true; // Mocked result

        if (isPhotoMatch) {
            await db.query('UPDATE users SET kyc_verified = ? WHERE user_id = ?', [true, userId]);
            res.status(200).json({ message: 'KYC verified successfully' });
        } else {
            res.status(400).json({ error: 'KYC verification failed' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
