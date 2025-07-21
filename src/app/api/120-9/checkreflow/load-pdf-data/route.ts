import { NextRequest, NextResponse } from 'next/server';
import { getDashboardConnection } from '@/lib/connection';
import sql from 'mssql';
import { convert } from 'pdf-poppler';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const model = searchParams.get('R_Model');
    const line = searchParams.get('R_Line');

    if (!model || !line) {
      return NextResponse.json({ success: false, message: 'Missing params' }, { status: 400 });
    }

    // 1. Connect to SQL and get PDF buffer
    const pool = await getDashboardConnection();
    const result = await pool.request()
      .input('R_Model', sql.NVarChar, model)
      .input('R_Line', sql.NVarChar, line)
      .query(`
        SELECT R_PDF FROM REFLOW_TEMP_STANDARD
        WHERE R_Line = @R_Line AND R_Model = @R_Model
      `);

    if (!result.recordset.length || !result.recordset[0].R_PDF) {
      return NextResponse.json({ success: false, message: 'PDF not found' }, { status: 404 });
    }

    const pdfBuffer = result.recordset[0].R_PDF;

    // 2. Save to temp file
    const tempDir = path.join(os.tmpdir(), 'pdf-img');
    await fs.mkdir(tempDir, { recursive: true });

    
    const fileName = `pdf_${crypto.randomUUID()}.pdf`;
    const pdfPath = path.join(tempDir, fileName);
    await fs.writeFile(pdfPath, pdfBuffer);

    // 3. Convert PDF → PNG (all pages)
    await convert(pdfPath, {
      format: 'png',
      out_dir: tempDir,
      out_prefix: 'page',
      page: undefined,
    });

    // 4. Read image(s) and return as base64
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
