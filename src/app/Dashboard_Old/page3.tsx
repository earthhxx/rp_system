'use client';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

type LineStatus = {
    line: string;
    model: string;
    productOrderNo: string;
    status: 'waiting' | 'checked' | 'null' | 'waitingResult' | 'resulted';
    time: string;
};

const STATUS_COLOR = {
    waiting: 'bg-yellow-400 text-yellow-900',
    checked: 'bg-blue-400 text-blue-900',
    null: 'bg-gray-400 text-gray-900',
    waitingResult: 'bg-orange-400 text-orange-900',
    resulted: 'bg-green-400 text-green-900',
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

            <div className="space-y-12">
                {/* Main full-width groups */}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
        <div className="rounded-2xl shadow-md border border-blue-300 bg-white hover:shadow-lg transition-all">
            <div className="flex flex-col gap-4 justify-between items-center ">
                <span className="font-bold text-4xl text-blue-900 mt-4">{line.line}</span>
                <span className="text-[24px] text-gray-700">
                    <p><strong>Model:</strong> {line.model}</p>
                    <p><strong>Order No:</strong> {line.productOrderNo}</p>
                    <p className="text-[18px] text-gray-500 mt-1">Updated: {line.time}</p>
                </span>
                <span
                    className={clsx(
                        'w-full px-2 py-1 text-[18px] font-semibold font-kanit rounded-b-xl capitalize',
                        STATUS_COLOR[line.status]
                    )}
                >
                    {line.status}
                </span>
            </div>
            

        </div>
    );
}
