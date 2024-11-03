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
            INSERT INTO loans (user_id, duration, amount, interest_rate)
            VALUES (?, ?, ?, ?)
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
            SELECT users.name, loans.loan_id, loans.duration, loans.amount, loans.interest_rate, loans.created
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

// Fetch a single loan's details by loan_id, including the user's name
export const getLoanDetails = async (req, res) => {
    const { loan_id } = req.params;
    let connection;

    if (!loan_id) {
        return res.status(400).json({ error: 'Loan ID is required' });
    }

    try {
        connection = await db.getConnection();
        const sql = `
            SELECT users.name, loans.loan_id, loans.duration, loans.amount, loans.interest_rate, loans.created
            FROM loans
            JOIN users ON loans.user_id = users.user_id
            WHERE loans.loan_id = ?
        `;

        const [loan] = await connection.query(sql, [loan_id]);

        if (loan.length === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        res.status(200).json({ loan: loan[0] });
        
    } catch (error) {
        console.error('Error fetching loan details:', error);
        res.status(500).json({ error: 'Failed to fetch loan details' });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};
