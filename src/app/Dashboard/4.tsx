'use client';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

type LineStatus = {
    line: string;
    model: string;
    productOrderNo: string;
    status: 'waiting' | 'checked' |'null';
    time: string;
};

const STATUS_COLOR = {
    waiting: 'bg-yellow-400/20 text-yellow-900',  // สีสำหรับ waiting
    checked: 'bg-blue-400/20 text-blue-900',     // สีสำหรับ checked
    null: 'bg-gray-400/10 text-gray-900/10'
};

export default function ActiveLinesDashboard() {
    const [lines, setLines] = useState<LineStatus[]>([]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/mock-line-status');
            const data = await res.json();
            setLines(data);
        } catch (err) {
            console.error('Failed to fetch line status', err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen w-full p-6 bg-gradient-to-br from-white to-blue-200 ">
            <h1 className="text-6xl font-kanit font-bold mb-8 text-blue-800 text-center">REFLOW STATUS DASHBOARD</h1>
            <div className="space-y-12 rounded-xl bg-black/10 p-6 m-1">
                {/* Main full-width groups */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8 ">
                    {lines.map((line, index) => (
                        <LineCard key={index} line={line} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function LineCard({ line }: { line: LineStatus }) {
    return (
        <div className="w-full">
            {/* 👇 ใส่ group ครอบไว้ */}
            <div className={clsx('relative flex flex-col justify-between rounded-2xl shadow-lg border border-blue-200 transition hover:shadow-xl hover:scale-[1.01] duration-300', STATUS_COLOR[line.status])}>

                {/* Status Badge */}
                <span
                    className={clsx(
                        'absolute -top-3 -left-3 px-3 py-1 text-xs font-bold rounded-full shadow-lg z-10',
                        STATUS_COLOR[line.status]
                    )}
                >
                    {line.status}
                </span>

                {/* เนื้อหา */}
                <div className="relative flex flex-col justify-center items-center p-4  ">
                    <div className="flex text-blue-800 text-[32px] font-bold">{line.line}</div>
                    <div className="h-[2px] bg-gray-200 w-[90%] mx-auto rounded-full" />
                    <div className='flex flex-col justify-center text-black text-[16px] font-kanit'>
                        <div className="flex text-[28px]">{line.model}</div>
                    </div>
                    {/* ✅ Time ที่มุมล่างขวา */}
                    <div className="absolute -bottom-12 right-0 text-blue-900 text-[30px] font-bold px-3 py-1 ">
                        15:00
                    </div>
                </div>
                <div className='flex flex-col justify-start text-black pe-4 ps-9'>
                    <p className=""><span className="">Order:</span> {line.productOrderNo}</p>
                    <div className='flex'>
                        <p className="  ">Start: {line.time}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
