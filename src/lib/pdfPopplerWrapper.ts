import { spawn } from 'child_process';
import path from 'path';

export async function convertWithBinary(
  pdfPath: string,
  options: {
    out_dir: string;
    out_prefix: string;
    format: 'png' | 'jpeg';
    binary: string;
  }
) {
  const { out_dir, out_prefix, format, binary } = options;

  return new Promise<void>((resolve, reject) => {
    const args = [
      `-${format}`,
      '-scale-to', '1024',
      pdfPath,
      path.join(out_dir, out_prefix)
    ];

    const proc = spawn(binary, args);

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pdftocairo failed with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}
