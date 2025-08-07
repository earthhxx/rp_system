"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from 'next/image';
import { BsUpcScan } from "react-icons/bs";
import { GoCheckCircle } from "react-icons/go";


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
            <span className="absolute flex justify-center items-center rounded-full  opacity-75 z-30">✅</span>
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
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const submitcardRef = useRef<HTMLDivElement>(null);
    const [CardCancelpro, setCardCancelpro] = useState(false);



    // สำหรับเก็บชื่อพนักงาน
    const [employeeName, setEmployeeName] = useState<string | null>(null);

    // สำหรับเก็บรหัสพนักงาน
    const [employeeUserName, setEmployeeUserName] = useState<string | null>(null);
    const [EmployeeNo, setEmployeeNo] = useState<string | null>(null);

    const loadEmployeeData = async (employeeID: string) => {
        const res = await fetch(`/api/120-2/select-Employee-id?UserName=${employeeID}`);
        const { success, data } = await res.json();
        if (success && data?.Name && data?.UserName) {
            setEmployeeName(data.Name);
            setEmployeeUserName(data.UserName);
        }
    };

    const handleChangeInputID = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmployeeNo(value);
        if (value.length === 4) {
            await loadEmployeeData(value);
        }
    };

    const removestatusindatabase = () => {
        if (selectedOrder && selectedLineId) {
            fetch("/api/120-9/dashboard/removestatus", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ST_Line: selectedLineId,
                    ST_Prod: selectedOrder,
                }),
            })
                .then((response) => {
                    if (!response.ok) throw new Error(`Failed to remove status: ${response.statusText}`);
                    return response.json();
                })
                .then(() => {

                })
                .catch((error) => {
                    console.error("Error removing status:", error);
                });
        }
    };

    const submitLogToReflow120_9 = async () => {
        if (!selectedLineId || !selectedOrder) {
            alert("Missing required fields to submit log");
            return;
        }

        try {
            const payload = {
                R_Line: selectedLineId,
                R_Model: selectedModel,
                productOrderNo: selectedOrder,
                ST_Status: 'CANCEL',
                Log_User: employeeName || null,
                Log_UserID: EmployeeNo || null,
            };

            const res = await fetch('/api/120-9/checkreflow/insert-REFLOW_log_with_username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                alert("Log submit failed:");
            } else {

            }

        } catch (error) {
            alert("Error submitting log:");
        }
    };


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const clickTarget = event.target as Node;

            if (CardCancelpro && submitcardRef.current && !submitcardRef.current.contains(clickTarget)) {
                // ตรวจสอบว่าคลิกนี้ "ไม่ใช่" ข้างใน cardRef ด้วย
                if (!cardRef.current || !cardRef.current.contains(clickTarget)) {
                    setCardCancelpro(false);
                    return; // ถ้าปิดอันนี้แล้ว ไม่ต้องเช็คอันต่อไป
                }
            }

            if (showConfirm && cardRef.current && !cardRef.current.contains(clickTarget)) {
                // ตรวจสอบว่าคลิกนี้ "ไม่ใช่" ข้างใน submitcardRef ด้วย
                if (!submitcardRef.current || !submitcardRef.current.contains(clickTarget)) {
                    setShowConfirm(false);
                    return; // ถ้าปิดอันนี้แล้ว ไม่ต้องเช็คอันต่อไป
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showConfirm, CardCancelpro]);





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
        const interval = setInterval(fetchLines, 30000);
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
                    setSelectedModel(line.model);
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

    const submitStage = () => {
        if (selectedOrder && selectedLineId && (EmployeeNo === employeeUserName)) {
            removestatusindatabase();
            submitLogToReflow120_9();
            alert(`Submitted log for Order: ${selectedOrder} on Line: ${selectedLineId}`);
            // ลบข้อมูลจาก state
            setEmployeeNo(null);
            setSelectedOrder(null);
            setSelectedModel("");
            setSelectedLineId(null);
            setShowConfirm(false);
            setCardCancelpro(false);
            //ลบข้อมูลจาก localStorage
            window.dispatchEvent(new Event("localProductOrderNo:removed"));
        }
        else {
            alert("Please select a valid order and line, and ensure the employee ID matches.");
            setShowConfirm(false);
        }
    }

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
                        <button
                            onClick={() => {
                                setCardCancelpro(true);
                            }}
                            className="p-2 bg-amber-300 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            กูอยู่นี้
                        </button>
                    </div>
                </div>
            )}
            {
                CardCancelpro && (
                    <div className="fixed inset-0 flex flex-col w-screen h-screen justify-center items-center z-50 bg-black/20 backdrop-blur-sm">
                        <div ref={submitcardRef} className="text-[14px] xl:text-xl transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl p-6">
                            <div className="flex justify-center items-center w-full text-white">Please enter your Employee ID :</div>
                            <div className="flex justify-center items-center w-full text-white">โปรดใส่รหัสพนักงานของคุณ : </div>
                            <div className="flex justify-center items-center w-full text-white">PLEASE CHECK YOUR ID ('ตรวจสอบข้อมูลของคุณ') = {employeeName || "ไม่มีข้อมูล"} </div>
                            <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
                            <input
                                type="text"
                                autoComplete="off"
                                onChange={handleChangeInputID}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="รหัสพนักงาน"
                            />
                            <div className="flex w-full h-full items-center">
                                <div className="flex flex-col text-white justify-center items-center font-kanit w-1/2">
                                    <div className="flex flex-col text-white justify-center items-center font-kanit w-1/2">
                                        <BsUpcScan className="size-15 xl:size-32 text-white"></BsUpcScan>
                                        <div>SCAN</div>
                                        <div>สแกน</div>
                                    </div>
                                </div>
                                <div
                                    onClick={() => {
                                        submitStage();
                                        
                                    }}
                                    className="flex flex-col text-white justify-center items-center font-kanit w-1/2">
                                    <GoCheckCircle className="size-15 xl:size-30 " />
                                    <div>
                                        SUBMIT
                                    </div>
                                    <div>
                                        ส่งข้อมูล
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default ActiveLinesDashboard;
