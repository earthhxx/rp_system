import { NextRequest, NextResponse } from 'next/server';

import { getDashboardConnection } from '@/lib/connection';

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
    const line = searchParams.get('ST_Line');

    // Validate input
    if (!line) {
      return NextResponse.json(
        { success: false, message: 'Missing R_Line query parameter' },
        { status: 400 }
      );
    }


    // Connect to SQL Server
    const pool = await getDashboardConnection();

    // Query the database
    const result = await pool.request()
      .input('ST_Line', sql.NVarChar, line)
      .query(`
        SELECT ST_Line,ST_Model,ST_Prod,ST_Status
        FROM REFLOW_TEST_Status 
        WHERE ST_Line = @ST_Line 
      `);

    const rows = result.recordset as ReflowRecordStatus[];

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Runningline not found for specified model and line' },
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
