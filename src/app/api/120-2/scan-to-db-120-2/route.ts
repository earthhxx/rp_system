import { NextResponse } from 'next/server';
import { getNewFCXTConnection } from '@/lib/connection';
import sql from 'mssql';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productOrderNo = url.searchParams.get('productOrderNo');
    if (!productOrderNo) {
      return NextResponse.json({ success: false, message: 'Missing productOrderNo' }, { status: 400 });
    }

    const pool = await getNewFCXTConnection();

    // 🔍 DEBUG SECTION
    const dbNameResult = await pool.request().query('SELECT DB_NAME() AS dbName');
  

    const tableCheck = await pool.request().query(`
      SELECT TOP 1 * 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'tb_ProductOrders'
    `);
    

    // 🔍 Query จริง
    const result = await pool.request()
      .input('productOrderNo', sql.NVarChar, productOrderNo)
      .query(`
        SELECT productOrderNo, productName, ProcessLine 
        FROM [NewFCXT(IM Thailand)].[dbo].[tb_ProductOrders] 
        WHERE productOrderNo = @productOrderNo
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.recordset[0] });
  } catch (error: any) {
    console.error('❌ DB Query Error:', error?.message || error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
