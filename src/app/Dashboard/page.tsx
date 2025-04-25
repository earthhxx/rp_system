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
        <div className="min-h-screen w-full p-6 bg-gradient-to-br from-white to-blue-200 ">
            <h1 className="text-6xl font-kanit font-bold mb-8 text-blue-800 text-center">REFLOW STATUS DASHBOARD</h1>

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
                    <div className=" grid grid-cols-2 gap-4">
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

                    </div>

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
        <div className="rounded-2xl shadow-md border border-blue-300  bg-white hover:shadow-lg transition-all">
            <div>
                <div className="flex">
                    <div className='flex w-[35%] justify-center items-center bg-blue-50'> 
                        <div className=" font-semibold text-lg text-blue-900 ">{line.line}</div>
                    </div>
                    <div className='flex flex-col w-full justify-center '>

                        <div className="flex flex-col justify-center items-start w-full  text-sm mt-4 mb-4 text-gray-700">
                            <p><strong>Model:</strong> {line.model}</p>
                            <p><strong>Order No:</strong> {line.productOrderNo}</p>
                            <p className="text-xs text-gray-500 mt-1">Updated: {line.time}</p>
                        </div>
                        <div className="flex ">
                            <span
                                className={clsx(
                                    'w-full px-2 py-1 text-[18px] font-semibold font-kanit rounded-br-xl capitalize text-center',
                                    STATUS_COLOR[line.status]
                                )}
                            >
                                {line.status}
                            </span>
                        </div>

                    </div>
                </div>
            </div>


        </div>
    );
}
