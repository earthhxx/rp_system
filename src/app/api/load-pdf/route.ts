import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/test'; // เปลี่ยน path ให้ตรงกับตำแหน่งของ db.js หรือ test.js

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const model = searchParams.get('R_Model');
    const line = searchParams.get('R_Line');

    if (!model || !line) {
      return NextResponse.json({ success: false, message: 'Missing employeeid query parameter' }, { status: 400 });
    }

    const pool = await createConnection();

    const [rows]: any = await pool.query(`SELECT [R_Model],[R_Line],[R_PDF] FROM [REFLOW_TEMP_STANDARD] where R_Line= @line and R_Model= @model`);
    
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('DB Query Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
