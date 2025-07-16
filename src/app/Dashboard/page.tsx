"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from 'next/image';


// Type definitions
type LineStatus = {
    id: string;
    model: string;
    workOrder: string;
    status: 'NULL' | 'WAITING' | 'ONCHECKING' | 'CHECKED';
    lastMeasured: string;
    waitTime: number;
    EmployeeID: string;
};

const animetion = {
    WAITING: "animate-spin-slow",
    ONCHECKING: 'animate-bounce',
    CHECKED: "animate-ping-slow",
    NULL: "",
};

// Util สำหรับจัดการ localStorage
function setJsonToLocalStorage<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("local-storage-change", { detail: { key, value } }));
}

function getJsonFromLocalStorage<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

function removeItemFromLocalStorage(key: string) {
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent("local-storage-change", { detail: { key, value: null } }));
}


const icons = {
    CHECKED: (
        <span className="flex items-center justify-center size-[56px]">
            <span className="absolute flex justify-center items-center rounded-full  opacity-75 animate-ping z-30">✅</span>
            <span className="z-10 text-[40px] ">✅</span>
        </span>
    ),
    WAITING: "⏳",
    NULL: <div className="size-[56px]"></div>,
    ONCHECKING: (
        <span className="flex items-center justify-center size-[56px]">
            <span className="z-10 text-[40px] "><Image className="flex "
                src="/images/circuit-board.png"
                width={100}
                height={100}
                alt="Picture of the author"
            /></span>
        </span>
    ),
};

const backgrounds = {
    CHECKED: "bg-pass",
    NULL: "bg-gray-300/40",
    WAITING: "bg-pending ",
    ONCHECKING: "bg-adjusting",
};

const colors = {
    CHECKED: "text-pass",
    NULL: "",
    WAITING: "text-pending",
    ONCHECKING: "text-adjusting",
};

const ActiveLinesDashboard: React.FC = () => {
    const [linesState, setLinesState] = useState<LineStatus[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'WAITING' | 'ONCHECKING' | 'CHECKED'>('ALL');

    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);



    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickOutsideCard = cardRef.current && !cardRef.current.contains(event.target as Node);

            // ถ้าเปิดเมนูอยู่ แล้วคลิกข้างนอก ให้ปิดเมนู
            if (isClickOutsideCard) {
                setShowConfirm(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);




    useEffect(() => {
        const fetchLines = async () => {
            try {

                const response = await fetch("/api/120-9/dashboard/select_status");
                if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
                const raw = await response.json();

                const mappedData: LineStatus[] = raw.data.map((item: any, index: number) => {
                    const stDatetime = item.ST_Datetime;
                    // console.log(stDatetime);
                    // แปลงจาก UTC+7 ไปเป็น UTC
                    const dateInUTC = new Date(new Date(stDatetime).getTime() - 7 * 60 * 60 * 1000);
                    const waitMinutes = Math.max(
                        0,
                        Math.floor((Date.now() - dateInUTC.getTime()) / 60000)
                    );



                    return {
                        id: item.ST_Line,
                        model: item.ST_Model || "",
                        workOrder: item.ST_Prod || "",
                        status: (item.ST_Status || "NULL") as LineStatus["status"],
                        lastMeasured: item.ST_Datetime || "-",
                        waitTime: waitMinutes,
                        EmployeeID: item.ST_EmployeeID || "",
                    };
                });
                setLinesState(mappedData);
            } catch (error) {
                console.error("Error fetching lines:", error);
            }
        };

        fetchLines();
        const interval = setInterval(fetchLines, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredLines = () => {
        if (filter === "WAITING") {
            return linesState.filter((line) => line.status === "WAITING");
        } else if (filter === "CHECKED") {
            return linesState.filter((line) => line.status === "CHECKED");
        } else if (filter === "ONCHECKING") {
            return linesState.filter((line) => line.status === "ONCHECKING");
        } else {
            return linesState.filter((line) => line.status);
        }
    };

    const renderLines = () => {
        return filteredLines().map((line) => (
            <div
                key={line.id}
                onClick={() => {
                    setSelectedOrder(line.workOrder);
                    // console.log(selectedOrder);
                    setSelectedLineId(line.id);
                    setShowConfirm(true);
                }}

                className={`card ${backgrounds[line.status]} whitespace-pre-line w-full pt-4 ps-4 pe-4 rounded-lg shadow-lg text-center text-black font-kanit`}
            >
                <div className="line-name font-bold text-2xl  pb-1">{`${line.id}`}</div>
                <div className={`flex justify-center status text-[36px] ${colors[line.status]} ${animetion[line.status]}`}>{icons[line.status]}</div>
                <div className="model text-[12px] pb-3 text-gray-600">
                    {line.status === "WAITING" && (
                        <div>WAITING (รอวัด)</div>
                    )}
                    {line.status === "ONCHECKING" && (
                        <div>ONCHECKING (กำลังวัด)</div>
                    )}
                    {line.status === "CHECKED" && (
                        <div>CHECKED (เช็คสําเร็จ)</div>
                    )}
                </div>
                <div className="">MODEL (โมเดล) </div>
                <div className="model text-[16px] ">{` ${line.model}`}</div>
                <div className="model text-[12px] ">{`Order : ${line.workOrder}`}</div>
                {line.status === "WAITING" && (
                    <div className="WAITING text-sm pt-2 text-red-600">
                        WAITING: {line.waitTime} minutes
                    </div>
                )}
                {["ONCHECKING", "CHECKED"].includes(line.status) && (
                    <div className="text-sm pt-2 text-black">
                        รหัสพนักงาน ( ID ) : {line.EmployeeID}
                    </div>
                )}


                <div className="last-measured text-sm text-gray-600 pb-1">
                    {`Start time (เวลา เริ่ม):\n ${line.lastMeasured.replace("T", " ").substring(0, 19)}`}
                </div>
            </div>
        ));
    };



    const renderFilterBar = () => {
        const filterOptions: { label: string; value: 'ALL' | 'WAITING' | 'ONCHECKING' | 'CHECKED' }[] = [
            { value: 'ALL', label: 'ALL\n (ทั้งหมด)' },
            { value: 'WAITING', label: 'WAITING\n (รอวัด)' },
            { value: 'ONCHECKING', label: 'ONCHECKING\n (กำลังวัด)' },
            { value: 'CHECKED', label: 'CHECKED\n (เช็คแล้ว)' },
        ];

        const activeClass = {
            ALL: "bg-gray-300 text-gray-800",
            WAITING: "bg-[#f7e1a7] text-yellow-900",
            ONCHECKING: "bg-[#9ec5fe] text-blue-600",
            CHECKED: "bg-[#a0d3a9] text-green-900",
        };

        return (
            <div className="w-full flex justify-center ">
                <div className="whitespace-pre-line flex flex-row flex-wrap sm:flex-nowrap gap-2 sm:gap-3 p-2 rounded-full shadow-2xl bg-sky-800/80 justify-center items-center w-full min-w-0 lg:w-lg xl:w-2xl">
                    {filterOptions.map(({ label, value }) => (
                        <button
                            key={value}
                            className={`flex w-1/4 px-1 sm:px-2 py-1 sm:py-2 pe-10 ps-10 text-[14px] rounded-full font-bold transition justify-center ${filter === value
                                ? activeClass[value]
                                : "bg-gray-200 text-gray-600"
                                }`}
                            onClick={() => setFilter(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        );
    };


    return (
        <>
            <div className="min-h-screen w-full p-4 bg-gray-100 backdrop-blur-3xl flex flex-col items-center">
                <div className="flex flex-row justify-center items-center me-2 ms-2 w-fit ">
                    <Image className="flex flex-none"
                        src="/images/438764.png"
                        width={100}
                        height={100}
                        alt="Picture of the author"
                    />
                    <div className="flex flex-col justify-center items-center w-full xl:w-3xl">
                        <h3 className="flex flex-col w-full h-full justify-center items-center font-noto font-extrabold text-blue-800 mb-2 sm:text-2xl md:text-2xl xl:text-4xl ">
                            <div>
                                PROFILE MEASUREMENT REALTIME
                            </div>
                            <div className="font-kanit text-blue-800/90">
                                โปรไฟล์การวัดผลแบบเรียลไทม์
                            </div>
                        </h3>
                        {renderFilterBar()}
                    </div>
                    <div className="flex flex-none w-[100px]"></div>
                </div>

                <div className="p-6 m-1 w-full">
                    <div className={` font-bold grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-5 gap-y-10 w-full h-full`}>
                        {renderLines()}
                    </div>
                </div>

            </div>
            {showConfirm && (
                <div className="fixed font-kanit inset-0 z-49 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
                    <div ref={cardRef} className="bg-white rounded-2xl shadow-xl px-6 py-5 sm:p-8 text-center w-full max-w-md mx-4">

                        <p className="text-black font-medium text-2xl mb-6 break-words">
                            Line {selectedLineId}
                        </p>
                        <p className="text-blue-700 text-2xl font-medium mb-6 break-words">
                            {selectedOrder}
                        </p>



                    </div>
                </div>
            )}
        </>
    );
};

export default ActiveLinesDashboard;
