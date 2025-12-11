const { Sequelize } = require('sequelize');
require('dotenv').config();

// 1. Check if we have a Cloud URL (DB_URL), otherwise use Local settings
const dbUrl = process.env.DB_URL;

let sequelize;

if (dbUrl) {
  // --- CLOUD CONNECTION (Neon/Render) ---
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Necessary for self-signed certs in cloud
      }
    },
    logging: false // Keeps console clean
  });
} else {
  // --- LOCAL CONNECTION (Fallback) ---
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false
    }
  );
}

module.exports = sequelize;