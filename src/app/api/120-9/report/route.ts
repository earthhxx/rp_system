// /app/api/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDashboardConnection } from '@/lib/connection'; // เปลี่ยนให้ตรงกับการเชื่อมต่อ SQL Server
import sql from 'mssql';

export async function POST(req: NextRequest) {
  try {
    // 👇 อ่านข้อมูลจาก body ของ request (ควรใช้ POST body ไม่ใช่ searchParams)
    const body = await req.json();
    const { name, department, description } = body;

    // ตรวจสอบข้อมูล
    if (!name || !department || !description) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // 👇 เชื่อมต่อ SQL Server
    const pool = await getDashboardConnection();

    // 👇 ใช้ parameterized query เพื่อความปลอดภัยจาก SQL Injection
    await pool
      .request()
      .input('Name', sql.NVarChar(100), name)
      .input('Department', sql.NVarChar(100), department)
      .input('Description', sql.NVarChar(sql.MAX), description)
      .query(`
        INSERT INTO ReportIssues (Name, Department, Description)
        VALUES (@Name, @Department, @Description)
      `);

    return NextResponse.json({ message: 'รายงานปัญหาสำเร็จ' }, { status: 200 });
  } catch (error) {
    console.error('Error reporting issue:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการรายงานปัญหา' },
      { status: 500 }
    );
  }
}
