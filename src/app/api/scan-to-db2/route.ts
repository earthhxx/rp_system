import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db-120-2'; // เปลี่ยน path ให้ตรงกับตำแหน่งของ db.js หรือ test.js

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const employeeid = searchParams.get('employeeid');

    if (!employeeid) {
      return NextResponse.json({ success: false, message: 'Missing employeeid query parameter' }, { status: 400 });
    }

    const pool = await createConnection();

    const [rows]: any = await pool.query(
      'SELECT productOrderNo, productName, ProcessLine FROM tb_ProductOrders WHERE productOrderNo = ?',
      [employeeid]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('DB Query Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
