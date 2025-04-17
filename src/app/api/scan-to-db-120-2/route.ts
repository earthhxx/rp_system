//https://localhost:3000/api/scan-to-db-120-2?productOrderNo=202504070017
import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db-120-2'; // สมมติว่าเป็นฟังก์ชันเชื่อมต่อฐานข้อมูล
import sql from 'mssql'; // นำเข้า mssql

export async function GET(req: Request) {
  try {
    // สร้าง URL จาก req.url
    const url = new URL(req.url);

    // ดึงค่า productOrderNo จาก query string
    const productOrderNo = url.searchParams.get('productOrderNo');
    console.log('Received productOrderNo:', productOrderNo);

    // ถ้าไม่มีค่า productOrderNo
    if (!productOrderNo) {
      return NextResponse.json({ success: false, message: 'Missing productOrderNo query parameter' }, { status: 400 });
    }

    // เชื่อมต่อฐานข้อมูล
    const pool = await createConnection();

    // Query ข้อมูลจาก SQL Server
    const result = await pool.request()
      .input('productOrderNo', sql.NVarChar, productOrderNo)
      .query('SELECT productOrderNo, productName, ProcessLine FROM tb_ProductOrders WHERE productOrderNo = @productOrderNo');

    // ถ้าไม่พบข้อมูล
    if (result.recordset.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // ส่งข้อมูลกลับ
    return NextResponse.json({ success: true, data: result.recordset[0] });

  } catch (error) {
    // ถ้าเกิด error
    console.error('DB Query Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
