import db from '../config/db.js';

// Create a new loan for a user
export const createLoan = async (req, res) => {
    const { user_id, duration, amount, interest_rate } = req.body;
    let connection;

    if (!user_id || !duration || !amount || !interest_rate) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        connection = await db.getConnection();

        const sql = `
            INSERT INTO loans (user_id, duration, amount, interest_rate, status)
            VALUES (?, ?, ?, ?, 'Bidding In Progress')
        `;

        const values = [user_id, duration, amount, interest_rate];
        const [result] = await connection.query(sql, values);

        // Fetch and return the newly created loan
        const [newLoan] = await connection.query('SELECT * FROM loans WHERE loan_id = ?', [result.insertId]);
        res.status(201).json({ message: 'Loan created successfully', loan: newLoan[0] });

    } catch (error) {
        console.error('Error creating loan:', error);
        res.status(500).json({ error: 'Failed to create loan' });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Fetch all loans for a specific user along with the user's name
export const getUserLoans = async (req, res) => {
    const { user_id } = req.params;
    let connection;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        connection = await db.getConnection();

        const sql = `
            SELECT users.name, loans.loan_id, loans.duration, loans.amount, loans.interest_rate, loans.created, loans.status
            FROM loans
            JOIN users ON loans.user_id = users.user_id
            WHERE users.user_id = ?
        `;

        const [loans] = await connection.query(sql, [user_id]);

        if (loans.length === 0) {
            return res.status(404).json({ message: 'No loans found for this user' });
        }

        res.status(200).json({ user: loans[0].name, loans });

    } catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({ error: 'Failed to fetch loans' });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Fetch a single loan's details by loan_id, including the user's name and all bids related to this loan with bidder names
export const getLoanDetails = async (req, res) => {
    const { loan_id } = req.params;
    let connection;

    if (!loan_id) {
        return res.status(400).json({ error: 'Loan ID is required' });
    }

    try {
        connection = await db.getConnection();

        // Query to get loan details along with the user's name
        const loanSql = `
            SELECT users.name AS user_name, loans.loan_id, loans.duration, loans.amount, loans.interest_rate, loans.created, loans.status
            FROM loans
            JOIN users ON loans.user_id = users.user_id
            WHERE loans.loan_id = ?
        `;
        const [loanResult] = await connection.query(loanSql, [loan_id]);

        if (loanResult.length === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        const loan = loanResult[0];

        // Query to get all bids related to this loan_id along with each bidder's name
        const bidsSql = `
            SELECT bids.bid_id, bids.bidder_id, users.name AS bidder_name, bids.bid_amount, bids.bid_duration,
                   bids.bid_interest_rate, bids.bid_date
            FROM bids
            JOIN users ON bids.bidder_id = users.user_id
            WHERE bids.loan_id = ?
        `;
        const [bids] = await connection.query(bidsSql, [loan_id]);

        // Send the response including loan details and related bids with bidder names
        res.status(200).json({ loan, bids });

    } catch (error) {
        console.error('Error fetching loan details and bids:', error);
        res.status(500).json({ error: 'Failed to fetch loan details and bids' });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// fetching filtered loans with pagination.
export const getFilteredLoans = async (req, res) => {

    let connection;
    const limit = parseInt(req.body.limit, 10) || 15;
    const offset = parseInt(req.body.offset, 10) || 0;

    const { filter } = req.body;

    // Construct the base SQL query
    let sql = 'SELECT * FROM loans WHERE 1=1';
    const params = [];

    // Apply filters if they exist
    if (filter.interest_rate && filter.interest_rate.length === 2) {
        sql += ' AND interest_rate BETWEEN ? AND ?';
        params.push(filter.interest_rate[0], filter.interest_rate[1]);
    }

    if (filter.amount && filter.amount.length === 2) {
        sql += ' AND amount BETWEEN ? AND ?';
        params.push(filter.amount[0], filter.amount[1]);
    }

    if (filter.duration && filter.duration.length === 2) {
        sql += ' AND duration BETWEEN ? AND ?';
        params.push(filter.duration[0], filter.duration[1]);
    }

    // Add pagination to the SQL query
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    try {
        connection = await db.getConnection();
        const [loans] = await connection.query(sql, params);
        res.status(200).json({ loans });
    } catch (error) {
        console.error('Error fetching filtered loans:', error);
        res.status(500).json({ error: 'Failed to fetch filtered loans' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
