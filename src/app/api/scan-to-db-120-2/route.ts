import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db-120-2'; // สมมติว่าเป็นฟังก์ชันเชื่อมต่อฐานข้อมูล
import sql from 'mssql'; // นำเข้า mssql

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const productOrderNo = searchParams.get('productOrderNo'); // เปลี่ยนเป็น productOrderNo แทน employeeid

    if (!productOrderNo) {
      return NextResponse.json({ success: false, message: 'Missing productOrderNo query parameter' }, { status: 400 });
    }

    // การเชื่อมต่อกับ SQL Server
    const pool = await createConnection(); // ฟังก์ชันนี้ต้องถูกปรับเพื่อใช้กับ mssql

    // Query ข้อมูลจาก SQL Server
    const result = await pool.request()
      .input('productOrderNo', sql.NVarChar, productOrderNo) // ป้อนค่าที่รับจาก query string
      .query('SELECT productOrderNo, productName, ProcessLine FROM tb_ProductOrders WHERE productOrderNo = @productOrderNo');

    if (result.recordset.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('DB Query Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
