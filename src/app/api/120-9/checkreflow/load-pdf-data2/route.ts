import { NextRequest, NextResponse } from 'next/server';
import { getDashboardConnection } from '@/lib/connection';
import sql from 'mssql';

// Correct type for database record
type Data = {
  success: boolean;
  data?: { R_PDF: string | null };
  message?: string;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const model = searchParams.get('R_Model');
    const line = searchParams.get('R_Line');

    if (!model || !line) {
      return NextResponse.json(
        { success: false, message: 'Missing R_Model or R_Line query parameter' },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching PDF for:', { model, line });
    }

    const pool = await getDashboardConnection();

    const result = await pool.request()
      .input('R_Model', sql.NVarChar, model)
      .input('R_Line', sql.NVarChar, line)
      .query(`
        SELECT TOP 1 R_PDF
        FROM REFLOW_Result
        WHERE Result_Line = @R_Line AND Result_Model = @R_Model
        ORDER BY CreateDate DESC
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, message: 'PDF not found for specified model and line' },
        { status: 404 }
      );
    }

    const row = result.recordset[0];

    let base64PDF: string | null = null;
    if (row.R_PDF) {
      if (Buffer.isBuffer(row.R_PDF)) {
        base64PDF = row.R_PDF.toString('base64');
      } else if (typeof row.R_PDF === 'string') {
        base64PDF = row.R_PDF; // กรณีเก็บเป็น base64 string แล้ว
      }
    }

    return NextResponse.json({
      success: true,
      data: { R_PDF: base64PDF },
    });

  } catch (error) {
    console.error('DB Query Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
