import { NextResponse } from 'next/server';

export async function GET() {
  const statuses = ['waiting', 'checked','null'];

  const mockData = Array.from({ length: 21 }, (_, i) => ({
    line: `SMT-${i + 1}`,
    model: 'QWDASASDMV2039',
    productOrderNo: '202508040022',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    time: new Date().toLocaleTimeString(),
  }));

  return NextResponse.json(mockData);
}
