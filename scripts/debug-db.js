const { Pool } = require("pg");
require("dotenv").config();

const debugDB = async () => {
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        console.log("Debugging DB...");

        // Fetch the last few posts
        const res = await pool.query("SELECT id, user_id, content, scheduled_at, is_published, created_at FROM posts ORDER BY id DESC LIMIT 5");
        console.log("Recent Posts:", res.rows);

    } catch (error) {
        console.error("Debug failed:", error);
    } finally {
        await pool.end();
    }
};

debugDB();
