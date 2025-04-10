import sql from 'mssql';

export const createConnection = async () => {
  try {
    const pool = await sql.connect({
      user: 'sa',                    
      password: 'B1mUmNU9',        
      server: '192.168.120.9',    
      database: 'DASHBOARD',        
      options: {
        encrypt: true,          
        trustServerCertificate: true, 
      },
      connectionTimeout: 10000,     
      requestTimeout: 15000,         
    });

    return pool;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
};

// // db.js
// import mysql from 'mysql2/promise';

// export const createConnection = async () => {
//   try {
//     const pool = await mysql.createPool({
//       host: 'localhost',       // หรือ IP Container ถ้ารันแยกกัน
//       user: 'dashboard_user',
//       password: 'dashboard_pass',
//       database: 'DASHBOARD',
//       waitForConnections: true,
//       connectionLimit: 10,
//       queueLimit: 0
//     });

//     console.log('✅ MySQL Connected');
//     return pool;
//   } catch (err) {
//     console.error('❌ MySQL connection error:', err);
//     throw err;
//   }
// };
