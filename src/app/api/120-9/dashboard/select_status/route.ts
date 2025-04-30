//https://localhost:3003/api/120-9/dashboard/select_status
//test url 
import { NextRequest, NextResponse } from 'next/server';

import { getDashboardConnection } from '@/lib/connection';

import sql from 'mssql';

// Define type for record from database
interface ReflowRecordStatus {
    ST_Line: string;
    ST_Model: string;
    ST_Prod: string;
    ST_Status: string;
    ST_Datetime: string;
}

export async function GET(req: NextRequest) {
    try {
        
        // Connect to SQL Server
        const pool = await getDashboardConnection();

        // Query the database
        const result = await pool.request()
            .query(`
          SELECT * FROM REFLOW_Status 
        `);

        const rows = result.recordset as ReflowRecordStatus[];

        if (rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Runningline not found for specified model and line' },
                { status: 404 }
            );
        }



        // Return only first record (if needed)
        return NextResponse.json({ success: true, data: rows });

    } catch (error) {
        console.error('DB Query Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
