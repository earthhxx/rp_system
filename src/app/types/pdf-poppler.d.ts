declare module 'pdf-poppler' {
  interface ConvertOptions {
    format?: 'jpeg' | 'png' | 'tiff';
    out_dir?: string;
    out_prefix?: string;
    page?: number;
    page_crop?: boolean;
    resolution?: number;
    scale?: number;
    singlefile?: boolean;
    grayscale?: boolean;
  }

  export function convert(pdfPath: string, options?: ConvertOptions): Promise<void>;
}
