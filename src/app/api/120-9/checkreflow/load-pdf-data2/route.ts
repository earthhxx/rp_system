import { NextRequest, NextResponse } from 'next/server';
import { getDashboardConnection } from '@/lib/connection';
import sql from 'mssql';
//https://localhost:3003/api/120-9/checkreflow/load-pdf-data2?R_Line=SMT-5&R_Model=NPVV067AA11MBO&productOrderNo=202504080022
//https://localhost:3003/api/120-9/checkreflow/load-pdf-data2?R_Line=SMT-2&R_Model=15F5ST80600AO
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


    if (!model || !line ) {
      return NextResponse.json(
        { success: false, message: 'Missing R_Model or R_Line query parameter' },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching PDF for:', { model, line});
    }

    const pool = await getDashboardConnection();

    const result = await pool.request()
      .input('R_Model', sql.NVarChar, model)
      .input('R_Line', sql.NVarChar, line)
      .query(`
        SELECT TOP 1 PDF_Loc
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
    if (row.PDF_Loc) {
      if (Buffer.isBuffer(row.PDF_Loc)) {
        base64PDF = row.PDF_Loc.toString('base64');
      } else if (typeof row.PDF_Loc === 'string') {
        base64PDF = row.PDF_Loc; // กรณีเก็บเป็น base64 string แล้ว
      }
    }

    return NextResponse.json({
      success: true,
      data: { R_PDF2: base64PDF },
    });

  } catch (error) {
    console.error('DB Query Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
