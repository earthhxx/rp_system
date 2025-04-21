import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db-120-9';
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
    const ProductOrderNos = searchParams.get('ProductOrderNos');

    // Validate input
    if (!ProductOrderNos) {
      return NextResponse.json(
        { success: false, message: 'Missing ProductOrderNos query parameter' },
        { status: 400 }
      );
    }

    


    // Connect to SQL Server
    const pool = await createConnection();

    // Query the database
    const result = await pool.request()
      .input('ProductOrderNos', sql.NVarChar, ProductOrderNos)
      .query(`
        SELECT ST_Line,ST_Model,ST_Prod,ST_Status
        FROM REFLOW_Status
        WHERE ST_Prod = @ProductOrderNos
      `);

    const rows = result.recordset as ReflowRecordStatus[];
    if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No data found for specified productOrderNo' },
          { status: 404 }
        );
      }
      


   

    // Return only first record (if needed)
    return NextResponse.json({ success: true, data:rows });

  } catch (error) {
    console.error('DB Query Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
