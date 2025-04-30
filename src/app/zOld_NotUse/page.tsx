'use client';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { BiHistory } from "react-icons/bi";
import { ImCheckboxChecked } from "react-icons/im";

type LineStatus = {
    line: string;
    model: string;
    productOrderNo: string;
    status: 'waiting' | 'checked' | 'null';
    time: string;
};

const STATUS_COLOR = {
    waiting: 'bg-yellow-400/20 text-yellow-900',  // สีสำหรับ waiting
    checked: 'bg-green-400/20 text-green-900',     // สีสำหรับ checked
    null: 'bg-gray-400/10 text-gray-900/10'
};

const STATUS_LOGO = {
    waiting: <BiHistory className='text-2xl size-5' />,  
    checked: <ImCheckboxChecked className='text-2xl size-5' />,  
    null: <div className='size-5'></div>,  
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
        <div className="min-h-screen w-full p-6 bg-gradient-to-br from-blue-100 to-blue-300">
            <h1 className="text-3xl sm:text-4xl font-kanit font-bold mb-4 text-blue-800 text-center">REFLOW STATUS DASHBOARD</h1>
            <div className="rounded-xl bg-white/10 shadow-md p-6 m-1">
                {/* Main full-width groups */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 ">   
                    {lines.map((line, index) => (
                        <LineCard key={index} line={line} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function LineCard({ line }: { line: LineStatus }) {
    const timeDiff = Math.floor((new Date().getTime() - new Date(line.time).getTime()) / 1000 / 60);  // ผลลัพธ์เป็น number

    return (
        <div className="w-full h-full">
            <div className={clsx(
                'flex flex-col justify-between rounded-lg p-6 shadow-2xl transition-transform hover:translate-y-2',
                STATUS_COLOR[line.status], 
    'bg-white' //ทำไมสีมืดตาม flex บน
            )}>
                <div className="relative flex flex-col justify-center items-center p-4">
                    <div className="text-xl sm:text-2xl font-bold text-blue-800">{line.line}</div>
                    {/* <div className="h-[1px] sm:h-[2px] bg-gray-200 w-full my-2 rounded-full" /> */}
                    <div className="status-icon text-xl sm:text-2xl">
                        {STATUS_LOGO[line.status]}
                    </div>
                    <div className="text-md text-black font-kanit mt-2">Model: {line.model}</div>
                    {/* <div className="absolute top-2 right-2 text-xs sm:text-sm text-blue-900 font-bold px-2 py-1 bg-white rounded-full shadow-md">
                        {line.time}
                    </div> */}
                    <div className='flex flex-col justify-center text-black p-4'>
                    <p className="text-xs sm:text-sm">
                        <span>Time Passed:</span> {timeDiff} minutes
                    </p>
                    <div className="flex items-center ">
                        <p className="text-xs sm:text-sm">Start: {line.time}</p>
                    </div>
                </div>
                </div>
            
            </div>
        </div>
    );
}
