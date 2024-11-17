import db from "../config/db.js";
import { generateOTP, verifyOTP } from "../middlewares/otp.js";
import axios from "axios";
import FormData from "form-data";

// Register User Step 1: Request OTP
export const requestOTP = async (req, res) => {
  const { aadhaar_number } = req.body;

  let connection;

  try {
    connection = await db.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM aadhaar WHERE aadhaar_number = ?",
      [aadhaar_number]
    );

    if (results.length === 0)
      return res.status(404).json({ error: "Aadhaar not found" });

    const aadhaarData = results[0];
    generateOTP(aadhaarData.phone);

    console.log(`OTP sent to ${aadhaarData.phone}`);
    res
      .status(200)
      .json({
        message: "OTP sent",
        aadhaar: aadhaar_number,
        phone: aadhaarData.phone,
      });
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
  const { aadhaar_number, otp, role, password } = req.body;

  let connection;

  try {
    connection = await db.getConnection();
    const [aadhaarResults] = await connection.query(
      "SELECT * FROM aadhaar WHERE aadhaar_number = ?",
      [aadhaar_number]
    );

    if (aadhaarResults.length === 0)
      return res.status(404).json({ error: "Aadhaar not found" });

    const aadhaarData = aadhaarResults[0];
    if (!verifyOTP(aadhaarData.phone, otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const userData = {
      name: aadhaarData.name,
      phone: aadhaarData.phone,
      aadhaar_number,
      role,
      kyc_verified: false,
      password,
    };

    const [result] = await db.query("INSERT INTO users SET ?", userData);
    res
      .status(201)
      .json({
        message: "User registered successfully",
        userId: result.insertId,
      });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Login User: Verify phone, password and fetch user details
export const userLogin = async (req, res) => {
  const { phone, password } = req.body;

  let connection;

  try {
    connection = await db.getConnection();

    // Fetch user details based on phone number
    const [userResults] = await connection.query(
      "SELECT * FROM users WHERE phone = ?",
      [phone]
    );

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not registered" });
    }

    const user = userResults[0];
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid Password" });
    }

    res.status(200).json({ message: "Login successful", user });
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
    const [results] = await connection.query(
      "SELECT * FROM users WHERE user_id = ?",
      [user_id]
    );

    if (results.length === 0)
      return res.status(404).json({ error: "User not found" });

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
  const { user_id, aadhaar_number } = req.body;

  if (!req.file) {
    return res
      .status(400)
      .json({ error: "Photo is required for KYC verification" });
  }

  let connection;

  try {
    connection = await db.getConnection();

    const [validationResults] = await connection.query(
      "SELECT * FROM users WHERE user_id = ? AND aadhaar_number = ?",
      [user_id, aadhaar_number]
    );
    if (validationResults.length === 0) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // Fetch Aadhaar photo
    const [aadhaarResults] = await connection.query(
      "SELECT photo FROM aadhaar WHERE aadhaar_number = ?",
      [aadhaar_number]
    );

    if (aadhaarResults.length === 0 || !aadhaarResults[0].photo) {
      return res
        .status(404)
        .json({ error: "No Aadhaar photo found for comparison" });
    }

    const aadhaarPhoto = aadhaarResults[0].photo;
    const uploadedPhoto = req.file.buffer;

    // Create a multipart form-data payload for the Flask server
    const formData = new FormData();
    formData.append("img1", Buffer.from(aadhaarPhoto), "aadhaar.jpg"); // Aadhaar photo
    formData.append("img2", uploadedPhoto, req.file.originalname); // Uploaded photo

    // Call the Flask API
    const flaskResponse = await axios.post(
      "http://127.0.0.1:5000/verify-kyc",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    const { verified, distance } = flaskResponse.data;

    if (!verified) {
      return res.status(400).json({
        error: "KYC verification failed: Photos do not match",
        distance,
      });
    }

    // If matched, store the uploaded photo and update KYC status
    await connection.query(
      "UPDATE users SET photo = ?, kyc_verified = ? WHERE user_id = ?",
      [uploadedPhoto, true, user_id]
    );
    res.status(200).json({ message: "KYC verified successfully", distance });
  } catch (err) {
    console.error("Error during KYC verification:", err);
    res.status(500).json({ error: "Failed to verify KYC" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Aadhaar Photo Upload
export const aadhaarUpload = async (req, res) => {
  const { aadhaar_number } = req.body;

  if (!req.file) {
    return res
      .status(400)
      .json({ error: "Photo is required to be added to Aadhaar Database" });
  }

  let connection;

  try {
    connection = await db.getConnection();

    const uploadPhoto = req.file.buffer;

    // Execute the query
    const query =
      "INSERT INTO aadhaar (aadhaar_number, photo) VALUES (?, ?) ON DUPLICATE KEY UPDATE photo = VALUES(photo)";
    await connection.execute(query, [aadhaar_number, uploadPhoto]);
    res.status(200).json({ message: "Photo updated successfully" });
  } catch (err) {
    console.error("Error updating photo:", err);
    res.status(500).json({ error: "Failed to upload photo" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const reverseAddress = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Google Maps Geocoding API endpoint
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await axios.get(url);

    if (response.data.status === "OK") {
      const address = response.data.results[0].formatted_address;
      res.status(200).json({
        success: true,
        address: address,
        fullResponse: response.data.results[0],
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to get address",
        status: response.data.status,
      });
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting address",
      error: error.message,
    });
  }
};
