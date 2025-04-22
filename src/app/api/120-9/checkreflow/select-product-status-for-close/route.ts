import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { createConnection } from '@/lib/connection';
=======
import { getDashboardConnection } from '@/lib/connection';
>>>>>>> 9c2d17547e788b8ffb6d5afa370c8c59a7f15ffe
import sql from 'mssql';

// Define type for record from database
interface ReflowRecordStatus {
    ST_Line: string;
    ST_Model: string;
    ST_Prod: string;
    ST_Status:string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const rawParam = searchParams.get('ProductOrderNos');
    const ProductOrderNos = rawParam?.split(',').map(p => p.trim());

    if (!ProductOrderNos || ProductOrderNos.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid ProductOrderNos' },
        { status: 400 }
      );
    }

    const pool = await getDashboardConnection();
    const request = pool.request();

    const inputPlaceholders = ProductOrderNos.map((_, i) => `@prod${i}`).join(', ');
    ProductOrderNos.forEach((value, i) => {
      request.input(`prod${i}`, sql.NVarChar, value);
    });

    const result = await request.query(`
      SELECT ST_Line, ST_Model, ST_Prod, ST_Status
      FROM REFLOW_Status
      WHERE ST_Prod IN (${inputPlaceholders})
    `);

    const rows = result.recordset as ReflowRecordStatus[];

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No data found for provided ProductOrderNos' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows });

  } catch (error) {
    console.error('🔥 DB Query Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
