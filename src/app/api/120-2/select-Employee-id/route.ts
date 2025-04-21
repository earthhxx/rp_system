import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db-120-2';
import sql from 'mssql';

// Define type for record from database
interface ReflowRecordUserName {
    UserName: string;
    Name: string;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const UserName = searchParams.get('UserName');

        // Validate input
        if (!UserName) {
            return NextResponse.json(
                { success: false, message: 'Missing UserName query parameter' },
                { status: 400 }
            );
        }


        // Connect to SQL Server
        const pool = await createConnection();

        // Query the database
        const result = await pool.request()
            .input('UserName', sql.NVarChar, UserName)
            .query(`
        SELECT [UserName],[Name] FROM [NewFCXT(IM Thailand)].[dbo].[tb_Employee] WHERE UserName = @UserName
`);

        const rows = result.recordset as ReflowRecordUserName[];
        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบข้อมูลพนักงานในระบบ',
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: rows[0] });


    } catch (error) {
        console.error('DB Query Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
