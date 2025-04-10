//https://localhost:3000/api/load-pdf-to-db-120-9?R_Line=SMT-5&R_Model=EUV9NS019AA
import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db-120-9';
import sql from 'mssql'; 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const model = searchParams.get('R_Model');
    const line = searchParams.get('R_Line');

    // ตรวจสอบว่าได้รับพารามิเตอร์หรือไม่
    if (!model || !line) {
      return NextResponse.json({ success: false, message: 'Missing R_Model or R_Line query parameter' }, { status: 400 });
    }

    const pool = await createConnection();

    // ใช้ SQL Server query และคำสั่งสำหรับ query
    const result = await pool.request()
      .input('R_Model', sql.NVarChar, model) // ใช้ input เพื่อหลีกเลี่ยง SQL Injection
      .input('R_Line', sql.NVarChar, line)
      .query('SELECT R_Model, R_Line, R_PDF FROM REFLOW_TEMP_STANDARD WHERE R_Line = @R_Line AND R_Model = @R_Model');

    const rows = result.recordset;

    // ตรวจสอบผลลัพธ์ว่าไม่พบข้อมูล
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // ส่งผลลัพธ์กลับไป
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('DB Query Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
