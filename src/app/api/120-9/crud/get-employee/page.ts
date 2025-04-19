import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

// Database configuration for db2
const dbConfig2 = {
  user: "sa",
  password: "B1mUmNU9",
  server: "192.168.120.2",
  database: "NewFCXT(IM Thailand)",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Function to get database connection
async function getDatabaseConnection(): Promise<void> {
  try {
    await sql.connect(dbConfig2);
  } catch (error: unknown) {
    // Type assertion to 'Error' to access message property
    if (error instanceof Error) {
      throw new Error("เชื่อมต่อฐานข้อมูลล้มเหลว: " + error.message);
    } else {
      throw new Error("เชื่อมต่อฐานข้อมูลล้มเหลว: ข้อผิดพลาดไม่รู้จัก");
    }
  }
}

// API handler function
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;

      // ตรวจสอบว่า id เป็น string ก่อนนำไปใช้ใน query
      if (typeof id !== 'string') {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      await getDatabaseConnection();

      // ใช้ query เพื่อดึงข้อมูลจากฐานข้อมูล
      const result = await sql.query`SELECT [Name] FROM [tb_Employee] WHERE [Label] = ${id}`;

      // ตรวจสอบผลลัพธ์
      if (result.recordset.length > 0) {
        res.status(200).json({ name: result.recordset[0].Name });
      } else {
        res.status(404).json({ error: "ไม่พบข้อมูลพนักงาน" });
      }
    } catch (error: unknown) {
      console.error("Error fetching employee data:", error);
      if (error instanceof Error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาด: " + error.message });
      } else {
        res.status(500).json({ error: "เกิดข้อผิดพลาดไม่ทราบประเภท" });
      }
    } finally {
      // No need to call sql.close() in the latest version of mssql
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
