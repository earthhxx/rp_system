import { NextRequest, NextResponse } from 'next/server';
import { getDashboardConnection } from '@/lib/connection';
import sql from 'mssql';


// Define type for record from database
interface ReflowLogRecord {
    id: number;
    line: string;
    model: string;
    productOrderNo: string;
    status: string;
    user: string | null;
    datetime: string;
}

export async function GET(req: NextRequest) {
    try {
        const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
        const pageSize = parseInt(req.nextUrl.searchParams.get('pageSize') || '10');
        const offset = (page - 1) * pageSize;
        const pool = await getDashboardConnection();

        // Select from database based on filters
        const result = await pool.request()
            .query(`
          SELECT * FROM (
            SELECT *, ROW_NUMBER() OVER (ORDER BY Datetime DESC) AS RowNum
            FROM REFLOW_Log
            ) AS Paged
            WHERE RowNum BETWEEN ${offset + 1} AND ${offset + pageSize}
      `);

        const countResult = await pool.request().query(`SELECT COUNT(*) AS total FROM REFLOW_Log`);
        const totalRecords = countResult.recordset[0].total;
        const totalPages = Math.ceil(totalRecords / pageSize);


        return NextResponse.json({ success: true, data: result.recordset, totalPages }, { status: 200 });

    } catch (error) {
        console.error('DB Select Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
