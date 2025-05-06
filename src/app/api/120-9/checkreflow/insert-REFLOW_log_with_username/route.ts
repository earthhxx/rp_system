import { NextRequest, NextResponse } from 'next/server';

import { getDashboardConnection } from '@/lib/connection';

import sql from 'mssql';

// Define type for incoming request
interface ReflowLogRequest {
  R_Line: string;
  R_Model: string;
  productOrderNo: string;
  ST_Status: string;
  Log_User: string;
  Log_UserID: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReflowLogRequest;

    const { R_Line, R_Model, productOrderNo, ST_Status,Log_User,Log_UserID} = body;

    // Validate input
    if (!R_Line || !R_Model || !productOrderNo || !ST_Status|| !Log_User || !Log_UserID) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields in request body' },
        { status: 400 }
      );
    }

    const pool = await getDashboardConnection();

    // Insert into database
    await pool.request()
      .input('Log_Line', sql.NVarChar, R_Line)
      .input('Log_Model', sql.NVarChar, R_Model)
      .input('Log_ProOrder', sql.NVarChar, productOrderNo)
      .input('Log_Status', sql.NVarChar, ST_Status)
      .input('Log_User', sql.NVarChar, Log_User)
      .input('Log_UserID', sql.NVarChar, Log_UserID)
      .input('Datetime', sql.DateTime, new Date())
      .query(`
        INSERT INTO REFLOW_Log (Log_Line, Log_Model, Log_ProOrder, Log_Status, Log_User, Log_UserID, Datetime)
        VALUES (@Log_Line, @Log_Model, @Log_ProOrder, @Log_Status, @Log_User, @Log_UserID, @Datetime)
      `);

    return NextResponse.json({ success: true, message: 'Log inserted successfully' });

  } catch (error) {
    console.error('DB Insert Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
