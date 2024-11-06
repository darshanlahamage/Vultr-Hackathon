import db from '../config/db.js';

// Function to create a new bid for a loan
export const createBid = async (req, res) => {
    const { loan_id, user_id, bid_amount, bid_duration, bid_interest_rate } = req.body;

    let connection;

    try {
        connection = await db.getConnection();

        // Insert the new bid into the Bids table
        //TODO: Ensure user cannot bid their own loans
        const [result] = await connection.query(
            'INSERT INTO bids (loan_id, bidder_id, bid_amount, bid_duration, bid_interest_rate) VALUES (?, ?, ?, ?, ?)',
            [loan_id, user_id, bid_amount, bid_duration, bid_interest_rate]
        );

        res.status(201).json({ message: 'Bid created successfully', bid_id: result.insertId });

    } catch (error) {
        console.error('Error creating bid:', error);
        res.status(500).json({ error: 'Failed to create bid' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Function to accept a bid and delete all other bids for the same loan
export const acceptBid = async (req, res) => {
    const { bid_id, loan_id } = req.body; // Assume bidId and loanId are passed in the request body

    let connection;

    try {
        connection = await db.getConnection();

        // Start a transaction to ensure atomicity
        await connection.beginTransaction();

        // Delete all other bids for the same loan, except the accepted bid
        //TODO: Check if bid_id exists
        await connection.query('DELETE FROM bids WHERE loan_id = ? AND bid_id != ?', [loan_id, bid_id]);

        // Commit the transaction
        await connection.commit();

        res.status(200).json({ message: 'Bid accepted, other bids deleted successfully.' });
    } catch (error) {
        await connection.rollback(); // Roll back if there's an error
        console.error('Error accepting bid:', error);
        res.status(500).json({ error: 'Failed to accept bid.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Fetch all bids placed by a user_id
export const getAllBidsByUser = async (req, res) => {
    const { user_id } = req.params;

    let connection;

    try {
        connection = await db.getConnection();
        const sql = `
            SELECT bids.bid_id, bids.bid_amount, bids.bid_duration, bids.bid_interest_rate, bids.bid_date, loans.loan_id
            FROM bids
            JOIN loans ON bids.loan_id = loans.loan_id
            WHERE bids.bidder_id = ?
        `;

        const [bids] = await connection.query(sql, [user_id]);

        if (bids.length === 0) {
            return res.status(404).json({ message: 'No bids found for this user' });
        }

        res.status(200).json({ bids });

    } catch (error) {
        console.error('Error fetching bids for user:', error);
        res.status(500).json({ error: 'Failed to fetch bids for user' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
