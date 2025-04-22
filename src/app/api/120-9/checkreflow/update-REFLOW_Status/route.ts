import { NextRequest, NextResponse } from 'next/server';
import { getDashboardConnection } from '@/lib/connection';
import sql from 'mssql';

// Define expected structure from request body
interface ReflowStatusUpdateRequest {
  ST_Line: string;
  ST_Model: string;
  ST_Prod: string;
  ST_Status: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReflowStatusUpdateRequest;
    const { ST_Line, ST_Model, ST_Prod, ST_Status } = body;

    if (!ST_Line || !ST_Model || !ST_Prod || !ST_Status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pool = await getDashboardConnection();

    const result = await pool.request()
      .input('ST_Line', sql.NVarChar, ST_Line || '')
      .input('ST_Model', sql.NVarChar, ST_Model || '')
      .input('ST_Prod', sql.NVarChar, ST_Prod || '')
      .input('ST_Status', sql.NVarChar, ST_Status || '')
      .query(`
        UPDATE REFLOW_Status
        SET ST_Model = @ST_Model,
            ST_Prod = @ST_Prod,
            ST_Status = @ST_Status
        WHERE ST_Line = @ST_Line
      `);

    return NextResponse.json({ success: true, message: 'Status updated successfully' });

  } catch (error) {
    console.error('DB Update Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
