import { NextRequest, NextResponse } from 'next/server';
import { getDashboardConnection } from '@/lib/connection';
import sql from 'mssql';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ST_Line } = body;

    if (!ST_Line) {
      return NextResponse.json({ success: false, message: 'Missing ST_Line' }, { status: 400 });
    }

    const pool = await getDashboardConnection();

    const result = await pool.request()
      .input('ST_Line', sql.NVarChar, ST_Line)
      .query(`
        UPDATE REFLOW_Status
        SET ST_Model = NULL,
            ST_Prod = NULL,
            ST_Status = NULL
        WHERE ST_Line = @ST_Line
      `);

    return NextResponse.json({
      success: true,
      message: `Set values to NULL for line ${ST_Line}`,
      affectedRows: result.rowsAffected
    });

  } catch (error) {
    console.error('❌ Error setting fields to NULL:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
