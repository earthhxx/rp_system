//https://localhost:3000/api/scan-to-db-120-2?productOrderNo=202504070017
import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db-120-2'; // สมมติว่าเป็นฟังก์ชันเชื่อมต่อฐานข้อมูล
import sql from 'mssql'; // นำเข้า mssql

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const productOrderNo = searchParams.get('ProductOrderNo');

    console.log('Received productOrderNo:', productOrderNo); // <-- log นี้ช่วยดูว่าพารามิเตอร์มาจริง

    if (!productOrderNo) {
      return NextResponse.json({ success: false, message: 'Missing productOrderNo' }, { status: 400 });
    }

    const pool = await createConnection();
    console.log('Database connected.');

    const result = await pool.request()
      .input('productOrderNo', sql.NVarChar, productOrderNo)
      .query('SELECT productOrderNo, productName, ProcessLine FROM tb_ProductOrders WHERE productOrderNo = @productOrderNo');

    console.log('Query result:', result.recordset);

    if (result.recordset.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('DB Query Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

