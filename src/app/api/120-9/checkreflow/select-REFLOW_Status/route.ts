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

    // console.log('--- Incoming Request ---');
    // console.log('ST_Line (query param):', line);
    // console.log('ST_Prod (query param):', pro);

    if (!line || !pro) {
      console.warn('Missing ST_Line or ST_Prod');
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

    // console.log('--- DB Result: prodRows ---');
    // console.log(prodRows);

    if (prodRows.length === 0) {
      // console.log('No ST_Prod found, fetching by ST_Line only...');
      const result = await pool.request()
        .input('ST_Line', sql.NVarChar, line)
        .query(`SELECT ST_Line, ST_Model, ST_Prod, ST_Status FROM REFLOW_Status WHERE ST_Line = @ST_Line`);
      const rows = result.recordset as ReflowRecordStatus[];
      // console.log('Rows fetched:', rows);
      return NextResponse.json({ success: true, data: rows });
    }


    const matchedRow = prodRows.find(
      (row) => row.ST_Line?.trim().toLowerCase() === line.trim().toLowerCase()
    );

    // 2. ตรวจสอบว่า ST_Line ที่รับมา ตรงกับ ST_Line ใน row ที่เจอมั้ย
    const foundMatchingLine = Boolean(matchedRow); // true ถ้าเจอ, false ถ้าไม่เจอ

    // console.log("foundMatchingLine:", foundMatchingLine);
    // console.log("matchedRow:", matchedRow);

    if (!foundMatchingLine) {
      // console.warn('ST_Line does not match any line for the given ST_Prod');
      return NextResponse.json(
        { success: false, message: `ST_Line does not match any line for the given ST_Prod : Productione Order ไม่ตรง เช็ค LINE = ${matchedRow}` },
        { status: 404 }
      );
    }

    // 3. ถ้าทั้ง prod และ line ตรง ดึงข้อมูลทั้งหมด
    // console.log('Fetching full data for line:', line);
    const result = await pool.request()
      .input('ST_Line', sql.NVarChar, line)
      .query(`SELECT ST_Line, ST_Model, ST_Prod, ST_Status FROM REFLOW_Status WHERE ST_Line = @ST_Line`);

    const rows = result.recordset as ReflowRecordStatus[];

    // console.log('Rows fetched:', rows);

    return NextResponse.json({ success: true, data: rows });

  } catch (error) {
    console.error('DB Query Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
