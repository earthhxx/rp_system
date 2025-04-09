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
  } catch (error) {
    throw new Error("เชื่อมต่อฐานข้อมูลล้มเหลว: " + error.message);
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await getDatabaseConnection();
      const result = await sql.query('SELECT [id], [R_UserName], [R_Model], [R_Line], [R_PDF], [Datetime] FROM [DASHBOARD].[dbo].[REFLOW_TEMP_STANDARD]');

      result.recordset.forEach(item => {
        item.R_PDF = item.R_PDF.toString('base64');
      });

      res.status(200).json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching data');
    } finally {
      await sql.close();
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
