import { NextRequest, NextResponse } from 'next/server';

import { getDashboardConnection } from '@/lib/connection';

import sql from 'mssql';

// Define expected structure from request body
interface ReflowStatusUpdateRequest {
  ST_Line: string;
  ST_Model: string;
  ST_Prod: string;
  ST_Status: string;
  ST_EmployeeID: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReflowStatusUpdateRequest;
    // console.log('body', body);
    const { ST_Line, ST_Model, ST_Prod, ST_Status, ST_EmployeeID } = body;

    if (!ST_Line || !ST_Model || !ST_Prod || !ST_Status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pool = await getDashboardConnection();

    const result = await pool.request()
      .input('ST_Line', sql.NVarChar, ST_Line) // ปรับตาม schema จริง
      .input('ST_Model', sql.NVarChar, ST_Model?.trim() || '')
      .input('ST_Prod', sql.NVarChar, ST_Prod?.trim() || '')
      .input('ST_Status', sql.NVarChar, ST_Status?.trim() || '')
      .input('ST_EmployeeID', sql.NVarChar, ST_EmployeeID?.trim() || '')

      .query(`
          UPDATE REFLOW_TEST_Status
          SET ST_Model = @ST_Model,
              ST_Prod = @ST_Prod,
              ST_Status = @ST_Status,
              ST_Datetime = GETDATE(),
              ST_EmployeeID = @ST_EmployeeID
          WHERE ST_Line = @ST_Line;

          SELECT ST_Status 
          FROM REFLOW_TEST_Status 
          WHERE ST_Line = @ST_Line;
      `);




    const newStatus = result.recordset?.[0]?.ST_Status;
    return NextResponse.json({
      success: true,
      data: { newStatus },
      message: `Status updated successfully: ${newStatus}`
    });


  } catch (error) {
    // console.error('DB Update Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
