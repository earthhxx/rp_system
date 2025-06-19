import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config(); // โหลด .env

let pool_NewFCXT: sql.ConnectionPool | null = null;
let pool_DASHBOARD: sql.ConnectionPool | null = null;

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`❌ Missing env: ${name}`);
  return value;
};

export const getNewFCXTConnection = async () => {
  if (pool_NewFCXT) return pool_NewFCXT;

  pool_NewFCXT = await new sql.ConnectionPool({
    user: requiredEnv('DB1_USER'),
    password: requiredEnv('DB1_PASSWORD'),
    server: requiredEnv('DB1_SERVER'),
    database: requiredEnv('DB1_NAME'),
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
    user: requiredEnv('DB2_USER'),
    password: requiredEnv('DB2_PASSWORD'),
    server: requiredEnv('DB2_SERVER'),
    database: requiredEnv('DB2_NAME'),
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  }).connect();

  console.log('✅ Connected to DASHBOARD DB');
  return pool_DASHBOARD;
};
