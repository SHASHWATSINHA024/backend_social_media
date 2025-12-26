const { Pool } = require("pg");
const logger = require("./logger");

let pool;

const initializePool = () => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on("connect", () => {
      logger.verbose("PostgreSQL pool connected");
    });

    pool.on("error", (err) => {
      logger.critical("Unexpected error on idle client", err);
      process.exit(1);
    });
  }

  return pool;
};

const connectDB = async () => {
  const dbPool = initializePool();
  const client = await dbPool.connect();
  client.release();
};

const query = (text, params = []) => {
  return initializePool().query(text, params);
};

const getClient = () => {
  return initializePool().connect();
};

module.exports = {
  connectDB,
  query,
  getClient,
};
