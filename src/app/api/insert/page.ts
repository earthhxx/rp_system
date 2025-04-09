import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs/promises';
import sql from 'mssql';
import { Request, Response } from 'express'; // import express

// สร้างประเภทใหม่เพื่อรองรับไฟล์
interface ExtendedNextApiRequest extends Request {
  file: Express.Multer.File;
}

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(null, false);
    }
    cb(null, true);
  },
});

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

async function getDatabaseConnection(dbName: string) {
  const config = dbName === "db1" ? dbConfig1 : dbConfig2;
  try {
    await sql.connect(config);
  } catch (error) {
    throw new Error("เชื่อมต่อฐานข้อมูลล้มเหลว: " + (error="s"));
  }
}

const handler = (req: Request, res: Response) => {
  // ใช้ multer middleware สำหรับการอัปโหลดไฟล์
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์" });
    }

    if (req.method === 'POST') {
      const { text1, text2, text3, text4 } = req.body;
      const dbName = req.query.dbName as string;

      // Validate dbName
      if (dbName !== "db1" && dbName !== "db2") {
        return res.status(400).json({ error: "ชื่อฐานข้อมูลไม่ถูกต้อง (ต้องเป็น db1 หรือ db2)" });
      }

      try {
        // Establish database connection
        await getDatabaseConnection(dbName);

        // ตรวจสอบว่าอัปโหลดไฟล์สำเร็จ
        if (!req.file) {
          return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์ PDF" });
        }

        // อ่านไฟล์ที่อัปโหลด
        const fileData = await fs.readFile(req.file.path);

        // เตรียมคำสั่ง SQL
        const query = `
          INSERT INTO REFLOW_TEMP_STANDARD ([R_ID_User], [R_UserName], [R_Model], [R_Line], [R_PDF], [Datetime])
          VALUES (@text1, @text2, @text3, @text4, @fileData, GETDATE())
        `;

        // เตรียมคำสั่ง SQL
        const request = new sql.Request();
        request.input('text1', sql.NVarChar(50), text1);
        request.input('text2', sql.NVarChar(255), text2);
        request.input('text3', sql.NVarChar(255), text3);
        request.input('text4', sql.NVarChar(50), text4);
        request.input('fileData', sql.VarBinary(sql.MAX), fileData);

        // execute SQL query
        await request.query(query);

        // ลบไฟล์หลังจากประมวลผลเสร็จ
        await fs.unlink(req.file.path);

        // ส่งการตอบกลับสำเร็จ
        res.status(200).json({ message: `บันทึกข้อมูลไปยัง ${dbName} สำเร็จ!` });
      } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({ error: "เกิดข้อผิดพลาด: " + error.message });
        } else {
          res.status(500).json({ error: "เกิดข้อผิดพลาดไม่ทราบประเภท" });
        }
      } finally {
      
      }
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  });
};

export default handler;
