import { NextRequest, NextResponse } from 'next/server';

import { getDashboardConnection } from '@/lib/connection';

import sql from 'mssql';

// Define type for record from database
interface ReflowRecordStatus {
  ST_Line: string;
  ST_Model: string;
  ST_Prod: string;
  ST_Status: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const line = searchParams.get('ST_Line');
    const pro = searchParams.get('ST_Prod');

    if (!line || !pro) {
      return NextResponse.json(
        { success: false, message: 'Missing ST_Line or ST_Prod query parameter' },
        { status: 400 }
      );
    }

    const pool = await getDashboardConnection();

    // 1. ตรวจสอบว่า ST_Prod มีในตารางมั้ย
    const checkProd = await pool.request()
      .input('ST_Prod', sql.NVarChar, pro)
      .query(`SELECT ST_Line FROM REFLOW_Status WHERE ST_Prod = @ST_Prod`);

    const prodRows = checkProd.recordset;

    // ถ้า ST_Prod ไม่มีในระบบ ให้ fallback ไปดูจาก ST_Line อย่างเดียว
    if (prodRows.length === 0) {
      const result = await pool.request()
        .input('ST_Line', sql.NVarChar, line)
        .query(`SELECT ST_Line, ST_Model, ST_Prod, ST_Status FROM REFLOW_Status WHERE ST_Line = @ST_Line`);
      const rows = result.recordset as ReflowRecordStatus[];
      return NextResponse.json({ success: true, data: rows });
    }

    // 2. ตรวจสอบว่า ST_Line ที่รับมา ตรงกับ ST_Line ใน row ที่เจอมั้ย
    const foundMatchingLine = prodRows.some((row) => row.ST_Line === line);

    if (!foundMatchingLine) {
      return NextResponse.json(
        { success: false, message: 'ST_Line does not match any line for the given ST_Prod' },
        { status: 404 }
      );
    }

    // 3. ถ้าทั้ง prod และ line ตรง ดึงข้อมูลทั้งหมด
    const result = await pool.request()
      .input('ST_Line', sql.NVarChar, line)
      .query(`SELECT ST_Line, ST_Model, ST_Prod, ST_Status FROM REFLOW_Status WHERE ST_Line = @ST_Line`);

    const rows = result.recordset as ReflowRecordStatus[];

    return NextResponse.json({ success: true, data: rows });

  } catch (error) {
    console.error('DB Query Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
