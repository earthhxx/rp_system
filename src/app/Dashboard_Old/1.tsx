'use client';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

type LineStatus = {
    line: string;
    model: string;
    productOrderNo: string;
    status: 'waiting' | 'checked' | 'null';
    time: string;
};

const STATUS_COLOR = {
    waiting: 'bg-yellow-400 text-yellow-900',
    checked: 'bg-blue-400 text-blue-900',
    null: 'bg-gray-400 text-gray-900',
};

const PRODUCTION_GROUPS: Record<string, string[]> = {
    'Production 1': ['SMT-1', 'SMT-5', 'SMT-10', 'SMT-11', 'SMT-12', 'SMT-13', 'SMT-14', 'SMT-15'],
    'Production 2': ['SMT-2', 'SMT-3', 'SMT-4', 'SMT-6', 'SMT-7', 'SMT-8', 'SMT-9'],
    'Production 3': ['SMT-18'],
    'Production 4': ['SMT-21'],
    'Production 5': ['SMT-19', 'SMT-20'],
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

    // Group lines by their production group
    const groupLinesByProduction = () => {
        return Object.entries(PRODUCTION_GROUPS).map(([groupName, lineList]) => {
            const groupLines = lines.filter((line) => lineList.includes(line.line));
            return { groupName, groupLines };
        });
    };

    const allGroups = groupLinesByProduction();
    const mainGroups = allGroups.filter(g => ['Production 1', 'Production 2'].includes(g.groupName));
    const compactGroups = allGroups.filter(g => ['Production 3', 'Production 4'].includes(g.groupName));
    const compactGroups2 = allGroups.filter(g => ['Production 5'].includes(g.groupName));

    return (
        <div className="min-h-screen w-full p-6 bg-gradient-to-br from-white to-blue-200">
            <h1 className="text-6xl font-kanit font-bold mb-8 text-blue-800 text-center">Active SMT Lines</h1>

            <div className="space-y-12">
                {/* Main full-width groups */}
                {mainGroups.map(({ groupName, groupLines }) => (
                    <div key={groupName}>
                        <h2 className="text-2xl font-semibold mb-4 text-blue-700">{groupName}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {groupLines.map((line, index) => (
                                <LineCard key={index} line={line} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Compact grid for Production 3, 4 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 justify-center items-center">
                    {compactGroups.map(({ groupName, groupLines }) => (
                        <div key={groupName} className="flex flex-col">
                            <h2 className="text-xl font-semibold mb-2 text-blue-700">{groupName}</h2>
                            <div className="flex flex-col gap-4">
                                {groupLines.map((line, index) => (
                                    <LineCard key={index} line={line} />
                                ))}
                            </div>
                        </div>
                    ))}

                    {compactGroups2.map(({ groupName, groupLines }) => (
                        <div key={groupName} className="grid grid-cols-1">
                            <h2 className="text-xl font-semibold mb-2 text-blue-700">{groupName}</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {groupLines.map((line, index) => (
                                    <LineCard key={index} line={line} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function LineCard({ line }: { line: LineStatus }) {
    return (
        <div className="w-full">
            {/* Status Badge */}
            <div className={clsx(
                'relative flex flex-col justify-between rounded-2xl shadow-lg border border-blue-200 bg-white transition hover:shadow-xl hover:scale-[1.01] duration-300', 
                STATUS_COLOR[line.status]
            )}>
                <span
                    className={clsx(
                        'absolute -top-3 -left-3 px-3 py-1 text-xs font-bold rounded-full shadow-lg z-10',
                        STATUS_COLOR[line.status]
                    )}
                >
                    {line.status}
                </span>

                <div className="relative flex flex-col justify-center items-center p-4">
                    <div className="flex text-blue-800 text-[32px] font-bold">{line.line}</div>
                    <div className="h-[2px] bg-gray-200 w-[90%] mx-auto rounded-full" />
                    <div className="flex flex-col justify-center text-black text-[16px] font-kanit">
                        <div className="flex text-[28px]">{line.model}</div>
                    </div>

                    <div className="absolute -bottom-12 right-0 text-blue-900 text-[30px] font-bold px-3 py-1">
                        {line.time}
                    </div>
                </div>

                <div className="flex flex-col justify-start text-black pe-4 ps-9">
                    <p><span>Order:</span> {line.productOrderNo}</p>
                    <div className="flex">
                        <p>Start: {line.time}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
