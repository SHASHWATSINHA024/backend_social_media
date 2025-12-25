const { Pool } = require("pg");
require("dotenv").config();

const migrate = async () => {
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        console.log("Running migration...");

        // Add scheduled_at column if it doesn't exist
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='scheduled_at') THEN
                    ALTER TABLE posts ADD COLUMN scheduled_at TIMESTAMP DEFAULT NULL;
                END IF;
            END
            $$;
        `);

        // Add is_published column if it doesn't exist
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='is_published') THEN
                    ALTER TABLE posts ADD COLUMN is_published BOOLEAN DEFAULT TRUE;
                END IF;
            END
            $$;
        `);

        // Add index for scheduled posts retrieval
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_posts_scheduled_published ON posts(scheduled_at, is_published);`);

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await pool.end();
    }
};

migrate();
