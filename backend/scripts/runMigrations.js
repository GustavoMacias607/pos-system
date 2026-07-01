const fs = require('fs');
const path = require('path');
const pool = require('../src/config/database');

const migrationsPath = path.join(__dirname, '..', 'migrations');

const runMigrations = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const executedResult = await pool.query(
            'SELECT filename FROM schema_migrations'
        );

        const executedMigrations = executedResult.rows.map(row => row.filename);

        const migrationFiles = fs
            .readdirSync(migrationsPath)
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const file of migrationFiles) {
            if (executedMigrations.includes(file)) {
                console.log(`Skipping ${file}`);
                continue;
            }

            const filePath = path.join(migrationsPath, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`Running ${file}`);

            await pool.query('BEGIN');
            await pool.query(sql);
            await pool.query(
                'INSERT INTO schema_migrations (filename) VALUES ($1)',
                [file]
            );
            await pool.query('COMMIT');

            console.log(`Finished ${file}`);
        }

        console.log('Migrations completed');
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

runMigrations();