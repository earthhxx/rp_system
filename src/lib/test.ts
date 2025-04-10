// db.ts
import mysql from 'mysql2/promise';

export const createConnection = async () => {
  try {
    const pool = await mysql.createPool({
      host: 'localhost',       // หรือ IP Container ถ้ารันแยกกัน
      user: 'dashboard_user',
      password: 'dashboard_pass',
      database: 'DASHBOARD',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('✅ MySQL Connected');
    return pool;
  } catch (err) {
    console.error('❌ MySQL connection error:', err);
    throw err;
  }
};
