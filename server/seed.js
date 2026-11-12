
const pool = require('./db');
const bcrypt = require('bcryptjs');

const users = [
    ['Pablo Alvarez', 'pablo_dev', 'pablo@example.com'],
    ['Ana Gomez', 'ana_dev', 'ana@example.com'],
    ['Carlos Perez', 'carlos_code', 'carlos@example.com'],
    ['Laura Restrepo', 'laura_design', 'laura@example.com'],
    ['Mateo Ruiz', 'mateo_tech', 'mateo@example.com'],
    ['Sofia Torres', 'sofia_web', 'sofia@example.com'],
    ['Andres Lopez', 'andres_dev', 'andres@example.com'],
    ['Camila Rios', 'camila_codes', 'camila@example.com'],
    ['Daniel Mesa', 'daniel_tech', 'daniel@example.com'],
    ['Valentina Diaz', 'valentina_dev', 'valentina@example.com'],
    ['Diego Castro', 'diego_web', 'diego@example.com'],
    ['Maria Fernanda', 'maria_code', 'maria@example.com'],
    ['Julian Torres', 'julian_git', 'julian@example.com'],
    ['Natalia Perez', 'natalia_dev', 'natalia@example.com'],
    ['Felipe Gomez', 'felipe_front', 'felipe@example.com'],
    ['Paula Rios', 'paula_code', 'paula@example.com'],
    ['Nicolas Ruiz', 'nico_react', 'nico@example.com'],
    ['Isabela Lopez', 'isabela_dev', 'isabela@example.com'],
    ['Santiago Mesa', 'santi_code', 'santiago@example.com'],
    ['Andrea Castro', 'andrea_web', 'andrea@example.com'],
    ['Esteban Diaz', 'esteban_dev', 'esteban@example.com'],
    ['Alejandra Ruiz', 'aleja_web', 'aleja@example.com'],
    ['Luis Fernando', 'frontend_luis', 'luis@example.com'],
    ['Juliana Marin', 'juliana_js', 'juliana@example.com'],
    ['Oscar Herrera', 'oscar_dev', 'oscar@example.com']
];

const messages = [
    'Aprendiendo algo nuevo cada dia.',
    'Hoy toca practicar JavaScript y Git.',
    'Pequenos avances todos los dias. 💻',
    'Construyendo proyectos y mejorando mis habilidades.',
    'Una buena interfaz necesita una buena estructura.',
    'Compartiendo ideas con la comunidad.',
    'La constancia es clave para aprender a programar.',
    'Probando nuevas funcionalidades en mi proyecto.',
    'React hace que crear interfaces sea interesante.',
    'Un commit a la vez. 🚀',
    'Hoy resolvi un problema que parecia imposible.',
    'El codigo limpio facilita el trabajo en equipo.',
    'Aprender de los errores tambien es avanzar.',
    'Explorando nuevas herramientas de desarrollo.',
    'Cada dia entiendo un poco mas de programacion.'
];

async function seedDatabase() {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Remove previous seed data in dependency order.
        await connection.query('DELETE FROM follows');
        await connection.query('DELETE FROM tweets');
        await connection.query('DELETE FROM users');

        const passwordHash = await bcrypt.hash('Demo123!', 10);

        const userIds = [];

        for (const [fullName, username, email] of users) {
            const [result] = await connection.query(
                `INSERT INTO users
                    (full_name, username, email, password_hash)
                 VALUES (?, ?, ?, ?)`,
                [fullName, username, email, passwordHash]
            );

            userIds.push(result.insertId);
        }

        for (let i = 0; i < 60; i++) {
            const authorIndex = i % users.length;
            const content = `${messages[i % messages.length]} (${i + 1})`;

            await connection.query(
                'INSERT INTO tweets (author_id, content) VALUES (?, ?)',
                [userIds[authorIndex], content]
            );
        }

        for (let i = 0; i < userIds.length; i++) {
            const followedId = userIds[(i + 1) % userIds.length];

            await connection.query(
                'INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)',
                [userIds[i], followedId]
            );
        }

        await connection.commit();

        console.log('Seed completed successfully.');
        console.log(`Users inserted: ${users.length}`);
        console.log('Tweets inserted: 60');
        console.log(`Follow relationships inserted: ${userIds.length}`);
        console.log('Demo password for all users: Demo123!');
    } catch (error) {
        await connection.rollback();
        console.error('Seed failed:', error.message);
        process.exitCode = 1;
    } finally {
        connection.release();
        await pool.end();
    }
}

seedDatabase();
