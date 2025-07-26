//RESULTPDF
import { NextRequest, NextResponse } from 'next/server';
import { getDashboardConnection } from '@/lib/connection';
import sql from 'mssql';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { convertWithBinary } from '@/lib/pdfPopplerWrapper'; // ฟังก์ชันที่ใช้ spawn ตัว pdftocairo.exe

const pdftocairoPath = 'C:\\Tools\\poppler-24.08.0\\Library\\bin\\pdftocairo.exe';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const model = searchParams.get('ST_Model');
    const line = searchParams.get('ST_Line');
    console.log(model,'model')
    console.log(line,'line')

    if (!model || !line) {
      return NextResponse.json({ success: false, message: 'Missing params' }, { status: 400 });
    }

    const pool = await getDashboardConnection();
    const result = await pool.request()
      .input('R_Model', sql.NVarChar, model)
      .input('R_Line', sql.NVarChar, line)
      .query(`
          SELECT TOP 1 PDF_Loc
        FROM REFLOW_Result
        WHERE Result_Line = @R_Line AND Result_Model = @R_Model
        ORDER BY CreateDate DESC
      `);

    if (!result.recordset.length || !result.recordset[0].PDF_Loc) {
      return NextResponse.json({ success: false, message: 'PDF not found' }, { status: 404 });
    }

    const pdfBuffer = result.recordset[0].PDF_Loc;
    
    const tempDir = path.join(os.tmpdir(), `pdf-img-${crypto.randomUUID()}`);
    await fs.mkdir(tempDir, { recursive: true });

    const fileName = `pdf_${crypto.randomUUID()}.pdf`;
    const pdfPath = path.join(tempDir, fileName);
    await fs.writeFile(pdfPath, pdfBuffer);

    // เรียกฟังก์ชัน convertWithBinary ที่ใช้ spawn ตัว pdftocairo.exe
    await convertWithBinary(pdfPath, {
      format: 'png',
      out_dir: tempDir,
      out_prefix: 'page',
      binary: pdftocairoPath,
    });

    const files = await fs.readdir(tempDir);
    const pngFiles = files.filter(f => f.endsWith('.png')).sort();

    const imagesBase64 = await Promise.all(
      pngFiles.map(async (fname) => {
        const img = await fs.readFile(path.join(tempDir, fname));
        return `data:image/png;base64,${img.toString('base64')}`;
      })
    );

    return NextResponse.json({ success: true, images: imagesBase64 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}


