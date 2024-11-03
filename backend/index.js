import dotenv from 'dotenv';
import app from './app.js';
import db from './config/db.js';

dotenv.config();
const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('This is the backend server for Vultr App');
});

const startServer = async () => {
    let connection;
    try {
        connection = await db.getConnection();
        console.log('Database connected successfully.');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} \n`);
        });

    } catch (error) {
        console.error('Failed to start the server:', error);

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

startServer();