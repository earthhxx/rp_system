"use client";
import React, { useEffect, useState } from "react";

// Type definitions
type LineStatus = {
    id: number;
    model: string;
    workOrder: string;
    status: 'null' | 'waiting' | 'CHECKED';
    lastMeasured: string;
    waitTime: number;
};

const animetion = {
    waiting: "animate-spin-slow", 
    CHECKED: "", 
    null: "",
};


const icons = {
    CHECKED: "✅",
    null: <div className="size-[55px]"></div>,
    waiting: "⏳ ",
};

const backgrounds = {
    CHECKED: "bg-pass",
    null: "bg-gray-300/40",
    waiting: "bg-pending ",
};

const colors = {
    CHECKED: "text-pass",
    null: "",
    waiting: "text-pending",
};

const ActiveLinesDashboard: React.FC = () => {
    const [linesState, setLinesState] = useState<LineStatus[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'WAITING' | 'CHECKED'>('ALL');

    useEffect(() => {
        const fetchLines = async () => {
            try {
                const response = await fetch("/api/mock_line");
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.statusText}`);
                }
                const data = await response.json();
                setLinesState(data);
            } catch (error) {
                console.error("Error fetching lines:", error);
            }
        };

        fetchLines();

        const interval = setInterval(() => {
            setLinesState((prevLines) =>
                prevLines.map((line) => {
                    if (line.status === "waiting") {
                        line.waitTime += 1;
                    } else {
                        line.waitTime = 0;
                    }
                    line.status = randomStatus();
                    line.lastMeasured = new Date().toLocaleTimeString();
                    return line;
                })
            );
        }, 60000); // ทุก 1 นาที

        return () => clearInterval(interval);
    }, []);

    const randomStatus = () => {
        const r = Math.random();
        if (r < 0.7) return "CHECKED";
        else if (r < 0.9) return "null";
        else return "waiting";
    };

    const filteredLines = () => {
        if (filter === "WAITING") {
            return linesState.filter((line) => line.status === "waiting");
        } else if (filter === "CHECKED") {
            return linesState.filter((line) => line.status === "CHECKED");
        } else {
            return linesState;
        }
    };

    const renderLines = () => {
        return filteredLines().map((line) => (
            <div
                key={line.id}
                className={`card ${backgrounds[line.status]} w-full pt-4 ps-4 pe-4 rounded-lg shadow-lg text-center text-black font-kanit`}
            >
                <div className="line-name font-bold text-xl  pb-1">{`${line.id}`}</div>
                <div className={`status text-[36px] ${colors[line.status]} ${animetion[line.status]}`}>{icons[line.status]}</div>
                <div className="model text-[12px] pb-3 text-gray-600">{`${line.status}`}</div>
                <div className="">MODEL </div>

                <div className="model text-[16px] pb-2 ">{` ${line.model}`}</div>
                <div className="waiting text-sm pt-2 text-red-600">
                    {line.status === "waiting"
                        ? `Waiting: ${Math.floor(line.waitTime / 60)} minutes`
                        : "-"}
                </div>
                <div className="last-measured text-sm text-gray-600 pb-1">
                    {`Start time : ${line.lastMeasured}`}
                </div>
            </div>
        ));
    };

    const renderFilterBar = () => {
        return (
            <div className="flex flex-row space-x-4 w-auto px-6 py-2 rounded-full justify-center shadow-2xl bg-sky-800/80 items-center z-70">
                <button
                    className={`px-10 py-2 rounded-full font-bold ${
                        filter === "ALL" ? "bg-blue-300 text-sky-800" : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={() => setFilter('ALL')}
                >
                    ALL
                </button>
                <button
                    className={`px-6 py-2 rounded-full font-bold ${
                        filter === "WAITING" ? "bg-yellow-300 text-yellow-900" : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={() => setFilter('WAITING')}
                >
                    WAITING
                </button>
                <button
                    className={`px-4 py-2 rounded-full font-bold ${
                        filter === "CHECKED" ? "bg-green-300 text-green-900" : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={() => setFilter('CHECKED')}
                >
                    CHECKED
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full p-4 bg-gray-100 backdrop-blur-3xl flex flex-col justify-center items-center">
            <h1 className="flex flex-none text-3xl sm:text-5xl font-bold font-kanit text-blue-800 mb-6">
                PROFILE MEASUREMENT REALTIME
            </h1>

            {renderFilterBar()}

            <div className="p-6 m-1 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-5 w-full h-full">
                    {renderLines()}
                </div>
            </div>
        </div>
    );
};

export default ActiveLinesDashboard;
