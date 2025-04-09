import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

// Database configuration
const dbConfig1 = {
  user: "sa",
  password: "B1mUmNU9",
  server: "192.168.120.9",
  database: "DASHBOARD",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Function to get database connection
async function getDatabaseConnection(): Promise<void> {
  try {
    await sql.connect(dbConfig1);
  } catch (error: any) {
    throw new Error("เชื่อมต่อฐานข้อมูลล้มเหลว: " + error.message);
  }
}

// API handler function
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;  // id should be a string, but we can safely convert it later

      if (typeof id !== 'string') {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      await getDatabaseConnection();
      
      const query = `DELETE FROM [DASHBOARD].[dbo].[REFLOW_TEMP_STANDARD] WHERE [id] = @id`;
      const request = new sql.Request();
      request.input('id', sql.Int, id);  // SQL input expects the id as a number, so we ensure it's converted

      const result = await request.query(query);

      if (result.rowsAffected[0] > 0) {
        res.status(200).json({ message: "ลบข้อมูลสำเร็จ" });
      } else {
        res.status(404).json({ error: "ไม่พบข้อมูลที่ต้องการลบ" });
      }
    } catch (error: any) {
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" });
    } finally {
   
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
