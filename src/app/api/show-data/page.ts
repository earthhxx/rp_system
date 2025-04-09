import { NextApiRequest, NextApiResponse } from 'next';  // ใช้ NextApiRequest และ NextApiResponse
import sql from 'mssql';

// กำหนดค่าเชื่อมต่อฐานข้อมูล
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

// ฟังก์ชันในการเชื่อมต่อกับฐานข้อมูล
async function getDatabaseConnection() {
  try {
    await sql.connect(dbConfig1);  // เชื่อมต่อกับฐานข้อมูล
  } catch (error: any) {  // ประกาศ error เป็นชนิด any
    throw new Error("เชื่อมต่อฐานข้อมูลล้มเหลว: " + error.message);
  }
}

// handler สำหรับ API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {  // ใช้ NextApiRequest และ NextApiResponse
  if (req.method === 'GET') {
    try {
      await getDatabaseConnection();  // เชื่อมต่อฐานข้อมูล

      // ทำการ query ข้อมูลจากฐานข้อมูล
      const result = await sql.query(`
        SELECT [id], [R_UserName], [R_Model], [R_Line], [R_PDF], [Datetime]
        FROM [DASHBOARD].[dbo].[REFLOW_TEMP_STANDARD]
      `);

      // แปลงข้อมูลในคอลัมน์ R_PDF เป็น base64 string
      result.recordset.forEach(item => {
        item.R_PDF = item.R_PDF.toString('base64');  // แปลง PDF เป็น base64 string
      });

      // ส่งผลลัพธ์กลับไปยัง client
      res.status(200).json(result.recordset);
    } catch (error: any) {  // ประกาศ error เป็นชนิด any
      console.error(error);  // แสดงข้อผิดพลาดใน console
      res.status(500).send('Error fetching data');  // ส่งข้อผิดพลาดกลับไป
    } finally {
    
    }
  } else {
    // หากไม่ใช่ GET method ให้ส่ง status 405 Method Not Allowed
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
