import { NextRequest, NextResponse } from 'next/server';

import { getDashboardConnection } from '@/lib/connection';

import sql from 'mssql';

// Define type for record from database
interface ReflowRecord {
  R_Model: string;
  R_Line: string;
  R_PDF: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const model = searchParams.get('R_Model');
    const line = searchParams.get('R_Line');

    // Validate input
    if (!model || !line) {
      return NextResponse.json(
        { success: false, message: 'Missing R_Model or R_Line query parameter' },
        { status: 400 }
      );
    }

    // Log input in development mode only
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('Fetching PDF for:', { model, line });
    // }

    // Connect to SQL Server
    const pool = await getDashboardConnection();

    // Query the database
    const result = await pool.request()
      .input('R_Model', sql.NVarChar, model)
      .input('R_Line', sql.NVarChar, line)
      .query(`
        SELECT R_Model, R_Line, R_PDF 
        FROM REFLOW_TEMP_STANDARD 
        WHERE R_Line = @R_Line AND R_Model = @R_Model
      `);

    const rows = result.recordset as ReflowRecord[];

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'PDF not found for specified model and line' },
        { status: 404 }
      );
    }

    // Convert R_PDF to base64
    const processedRows = rows.map(item => ({
      ...item,
      R_PDF: item.R_PDF && Buffer.isBuffer(item.R_PDF)
        ? item.R_PDF.toString('base64')
        : null,
    }));

    // Return only first record (if needed)
    return NextResponse.json({ success: true, data: processedRows[0] });

  } catch (error) {
    console.error('DB Query Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
