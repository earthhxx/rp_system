import { NextRequest, NextResponse } from 'next/server';

type LineStatus = {
    id: string;
    model: string;
    workOrder: string;
    status: 'null' | 'waiting' | 'CHECKED';  // Updated to match the new statuses
    lastMeasured: string;
    waitTime: number;
  };
  

const mockWOs = ['WO-1001', 'WO-1002', 'WO-1003', 'WO-1004', 'WO-1005'];

const statuses: ('null' | 'waiting' | 'CHECKED')[] = ['null', 'waiting', 'CHECKED'];

const getRandomStatus = () => {
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// เปลี่ยน id ให้เป็น 'SMT-1', 'SMT-2', ..., 'SMT-21' และ model เป็น '202508040022'
const lines: LineStatus[] = Array.from({ length: 21 }, (_, i) => ({
  id: `SMT-${i + 1}`,  // กำหนด id ให้เป็น 'SMT-1' ถึง 'SMT-21'
  model: 'AASIHFIENFSAAAAAAAAA',  // กำหนด model เป็น '202508040022' สำหรับทุกรายการ
  workOrder: mockWOs[Math.floor(Math.random() * mockWOs.length)],
  status: getRandomStatus(),
  lastMeasured: '-',
  waitTime: 0,
}));

// Helper function to simulate a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Exporting GET method handler
export async function GET(req: NextRequest) {
  // Wait for 10 seconds before returning the response
  await delay(0);  // 10000 milliseconds = 10 seconds

  return NextResponse.json(lines);
}
