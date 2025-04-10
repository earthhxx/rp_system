import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '../../../lib/db';
import sql from 'mssql';
import { writeFile,mkdir } from 'fs/promises';
import path from 'path';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const team = searchParams.get('O_team');
    const room = searchParams.get('O_room');
    // console.log('Team:', team); // ตรวจสอบค่า team
    // console.log('Room:', room); // ตรวจสอบค่า room

    if (!team || !room) {
      return NextResponse.json({ message: 'Missing team parameter' }, { status: 400 });
    }

    const pool = await createConnection();
    const result = await pool
      .request()
      .input('team', sql.VarChar, team)
      .input('room', sql.VarChar, room)
      .query(`SELECT O_Room, O_Team, O_Dep, O_Loc, O_PDFs FROM ORGANIZATION WHERE O_Room = @room AND O_Team = @team Order by O_Loc desc`);

    console.log('Query result:', result.recordset); // ตรวจสอบผลลัพธ์จากฐานข้อมูล

    if (result.recordset.length === 0) {
      return NextResponse.json({ message: 'No data found' }, { status: 404 });
      // console.log(result.recordset)
    }

    // สร้างไฟล์ 
    const pdfUrls = [];
    for (const row of result.recordset) {
      const { O_Room, O_Team, O_Dep, O_Loc, O_PDFs } = row;
      // console.log(pdfUrls)

      if (!O_PDFs) {
        continue; 
      }

      // Create the file path where the PDF will be saved
      const folderPath = path.join(process.cwd(), 'public', 'ORGANIZED');
      const filePath = path.join(folderPath, `department_${O_Dep}room_${O_Room}team_${O_Team}depart_${O_Loc}.pdf`);

      // Ensure the directory exists; create it if it doesn't
      await mkdir(folderPath, { recursive: true });

      await writeFile(filePath, Buffer.from(O_PDFs));



      
      pdfUrls.push({
        room: O_Room,
        team: O_Team,
        department: O_Dep,
        location: O_Loc,
        pdfUrl: `/ORGANIZED/department_${O_Dep}room_${O_Room}team_${O_Team}depart_${O_Loc}.pdf`,
      });
    }

    return NextResponse.json({ data: pdfUrls });

  } catch (error) {
    console.error('Error fetching data:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
