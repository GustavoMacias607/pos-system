const expectedDatabase = 'pos_test_db';

if (process.env.DB_NAME !== expectedDatabase) {
    console.error(
        `Migration blocked: DB_NAME must be "${expectedDatabase}"`
    );
    process.exit(1);
}

require('./runMigrations');
