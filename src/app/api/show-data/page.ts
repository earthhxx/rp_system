import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

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

async function getDatabaseConnection() {
  try {
    await sql.connect(dbConfig1);
  } catch (error: any) {
    throw new Error("เชื่อมต่อฐานข้อมูลล้มเหลว: " + error.message);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: 'Missing employeeId' });
    }

    try {
      await getDatabaseConnection();

      const result = await sql.query(`
        SELECT TOP 1 [id], [R_UserName], [R_Model], [R_Line], [R_PDF], [Datetime]
        FROM [DASHBOARD].[dbo].[REFLOW_TEMP_STANDARD]
        WHERE R_UserName = '${employeeId}'
        ORDER BY [Datetime] DESC
      `);

      const record = result.recordset[0];

      if (record) {
        record.R_PDF = record.R_PDF.toString('base64'); // แปลงเป็น base64
        res.status(200).json(record);
      } else {
        res.status(404).json({ error: 'No data found for this employeeId' });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).send('Error fetching data');
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
