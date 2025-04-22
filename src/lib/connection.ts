import sql from 'mssql';

let pool_NewFCXT: sql.ConnectionPool | null = null;
let pool_DASHBOARD: sql.ConnectionPool | null = null;

export const getNewFCXTConnection = async () => {
  if (pool_NewFCXT) return pool_NewFCXT;
  
  pool_NewFCXT = await new sql.ConnectionPool({
    user: 'sa',
    password: 'B1mUmNU9',
    server: '192.168.120.2',
    database: 'NewFCXT(IM Thailand)',
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
    user: 'sa',
    password: 'B1mUmNU9',
    server: '192.168.120.2',
    database: 'DASHBOARD',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  }).connect();

  console.log('✅ Connected to DASHBOARD DB');
  return pool_DASHBOARD;
};
