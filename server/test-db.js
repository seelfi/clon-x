
const pool = require('./db');

async function testConnection() {
    try {
        const connection = await pool.getConnection();

        console.log('¡Conexión exitosa con MySQL!');

        const [rows] = await connection.query(
            'SELECT DATABASE() AS databaseName'
        );

        console.log('Base de datos conectada:', rows[0].databaseName);

        connection.release();
        await pool.end();
    } catch (error) {
        console.error('Error al conectar con MySQL:', error.message);
        process.exitCode = 1;
    }
}

testConnection();
