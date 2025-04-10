import sql from 'mssql';

export const createConnection = async () => {
  try {
    const pool = await sql.connect({
      user: 'sa',                    
      password: 'B1mUmNU9',        
      server: '192.168.120.2',    
      database: 'NewFCXT(IM Thailand)',        
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