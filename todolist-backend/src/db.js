const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Start with: npm run dev");
  process.exit(1);
}

// One pool for the whole app. Everything that needs the database imports this.
module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
