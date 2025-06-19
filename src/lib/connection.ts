import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config(); // โหลด .env

let pool_NewFCXT: sql.ConnectionPool | null = null;
let pool_DASHBOARD: sql.ConnectionPool | null = null;

export const getNewFCXTConnection = async () => {
  if (pool_NewFCXT) return pool_NewFCXT;

  pool_NewFCXT = await new sql.ConnectionPool({
    user: process.env.DB1_USER!,
    password: process.env.DB1_PASSWORD!,
    server: process.env.DB1_SERVER!,
    database: process.env.DB1_NAME!,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  }).connect();

  console.log('✅ Connected to NewFCXT DB');
  return pool_NewFCXT;
};

export const getDashboardConnection = async () => {
  if (pool_DASHBOARD) return pool_DASHBOARD;

  pool_DASHBOARD = await new sql.ConnectionPool({
    user: process.env.DB2_USER!,
    password: process.env.DB2_PASSWORD!,
    server: process.env.DB2_SERVER!,
    database: process.env.DB2_NAME!,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  }).connect();

  console.log('✅ Connected to DASHBOARD DB');
  return pool_DASHBOARD;
};
