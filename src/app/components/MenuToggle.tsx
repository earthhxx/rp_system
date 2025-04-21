"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { GoSkipFill, GoCheckCircle } from "react-icons/go";
import { BsUpcScan, BsClipboard2DataFill } from "react-icons/bs";
import { motion } from "framer-motion";
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname, } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";

interface ReflowStatus {
    ST_Line: string;
    ST_Model: string;
    ST_Prod: string;
    ST_Status: string;
}

const MenuToggle = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [homeStage, setHomeStage] = useState<"home" | "scan" | "dashboard" | "menuOpen" | "closeprod">("home");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 500 });
    const [dragBounds, setDragBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
    const [productOrderNo, setProductOrderNo] = useState("");
    const [isCardOpen, setIsCardOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const inputProdRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const cardProdRef = useRef<HTMLDivElement>(null);

    const [statusData, setStatusData] = useState<ReflowStatus | null>(null);
    const [error, setError] = useState("");


    const searchParams = useSearchParams();
    const ProductOrderNos = searchParams.get('ProductOrderNos');
    


    const [EmployeeNo, setEmployeeNo] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [employeeUserName, setEmployeeUserName] = useState("");

    useEffect(() => {
        const fetchStatusData = async () => {
           
            try {
                const res = await fetch(`https://localhost:3000/api/120-9/checkreflow/select-product-status-for-close?ProductOrderNos=${ProductOrderNos}`);
                const result = await res.json();

                if (result.success && result.data.length > 0) {
                    setStatusData(result.data[0]); // ใช้ record แรก
                    console.log('after setdata ',result.data[0]);
                } else {
                    setError(result.message || "No data found");
                }
            } catch (err) {
                setError("Failed to fetch data");
                console.error("Error fetching reflow status:", err);
            }
        };

        if (ProductOrderNos) {
            fetchStatusData();
        }
    }, [ProductOrderNos]);

    useEffect(() => {
        const fetchEmployeeName = async () => {
            const res = await fetch(`https://localhost:3000/api/120-2/select-Employee-id?UserName=${EmployeeNo}`);
            const { success, data } = await res.json();
            console.log(data);

            if (success && data?.Name && data?.UserName) {
                setEmployeeName(data.Name);
                setEmployeeUserName(data.UserName);
            }
        };

        if (EmployeeNo) fetchEmployeeName();
    }, [EmployeeNo]);


    const submitLogToReflow120_9_CLOSE = async () => {
        try {
            if (EmployeeNo === employeeUserName &&
                statusData?.ST_Status !== "waiting" &&
                statusData?.ST_Status !== null) {
                console.log(statusData);
                const payload = {
                    R_Line: statusData?.ST_Line,
                    R_Model: statusData?.ST_Model,
                    productOrderNo: ProductOrderNos,
                    ST_Status: "CLOSE",
                    Log_User: EmployeeNo
                };

                const res = await fetch('/api/120-9/checkreflow/close-reflow-prod', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();

                if (!res.ok || !result.success) {
                    console.error("Log close submit failed:", result.message);
                } else {
                    console.log("Log close submitted successfully");
                }
            }
            else{
                console.error("make sure your're not in waiting status:",error);
            }
        } catch (error) {
            console.error("Error close submitting log ", error);
        }
    };

    const updateReflowStatus = async () => {
        const res = await fetch('/api/120-9/checkreflow/update-REFLOW_Status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ST_Line: statusData?.ST_Line,
                ST_Model: null,
                ST_Prod: null,
                ST_Status: null
            })
        })
    };


    useEffect(() => {
        if (typeof window !== "undefined") {
            setDragBounds({
                left: 0,
                top: 0,
                right: window.innerWidth - 80,
                bottom: window.innerHeight - 80,
            });
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickOutsideMenu = menuRef.current && !menuRef.current.contains(event.target as Node);
            const isClickOutsideCard = cardRef.current && !cardRef.current.contains(event.target as Node);

            // ถ้าเปิดเมนูอยู่ แล้วคลิกข้างนอก ให้ปิดเมนู
            if (homeStage === "menuOpen" && isClickOutsideMenu) {
                setIsMenuOpen(false);
                setHomeStage("home");
            }

            // ถ้าอยู่หน้า scan แล้วคลิกข้างนอก card ให้กลับ home
            if (homeStage === "scan" && isClickOutsideCard) {
                setHomeStage("home");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [homeStage]);

    useEffect(() => {
        if (homeStage === "scan") {
            const scanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: 250 },
                false // verbose
            );

            scanner.render(
                (decodedText, decodedResult) => {
                    console.log("Success", decodedText);
                    setProductOrderNo(decodedText);
                    scanner.clear();
                },
                (errorMessage) => {
                    console.warn("Error", errorMessage);
                }
            );


            return () => {
                scanner.clear().catch((error) => console.error("Clear failed", error));
            };
        }
    }, [homeStage]);






    const renderHomeButton = () => (
        <motion.div
            className="fixed h-fit w-fit justify-center items-center pb-8 pt-5 pl-3 pr-3 z-90"
            whileTap={{ scale: 0.9 }}
            drag
            dragConstraints={dragBounds}
            dragElastic={0.2}
            style={{ x: position.x, y: position.y }}
            onDragEnd={(e, info) => {
                setPosition({ x: info.point.x, y: info.point.y });
            }}
        >
            <div className="flex flex-col size-[62px] justify-start items-start z-10 animate-bounce">
                <div className="fixed flex flex-col size-[62px] bg-black/70 blur-[4] rounded-2xl justify-center items-center mr-[3px] mt-[2px] ml-[2px] cursor-pointer z-10 drop-shadow-2xl"></div>
                <div
                    className="fixed flex flex-col size-15 bg-white blur-[4] rounded-2xl justify-center items-center mr-[2px] cursor-pointer z-20"
                    onClick={() => {
                        setIsMenuOpen(true);
                        setHomeStage("menuOpen");
                    }}
                >
                    <Image src="/images/LOGO3.png" alt="Menu Image" width={50} height={50} draggable={false} />
                </div>
                <span className="relative top-0 left-12 inline-flex size-3 rounded-full bg-blue-800 z-40">
                    <span className="absolute inline-flex size-3 h-full w-full animate-ping rounded-full bg-sky-700 opacity-75 z-50" />
                </span>
            </div>
        </motion.div>
    );

    const renderMenu = () => (
        <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-90 bg-black/20 backdrop-blur-sm">
            <div
                ref={menuRef}
                className="grid grid-cols-3 gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6"
            >
                <div className="flex w-full h-full"></div>
                <div
                    onClick={() => {
                        setHomeStage("closeprod");
                        setIsMenuOpen(false);
                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white">
                    <GoCheckCircle className="size-30 text-white" />
                    SUBMIT PRODUCT
                </div>
                <div className="flex w-full h-full"></div>
                <div className="flex flex-col justify-center items-center w-full h-full text-white">
                    <BsClipboard2DataFill className="size-30 text-white" />
                    DASHBOARD
                </div>
                <div className="flex w-full h-full"></div>
                <div
                    onClick={() => {
                        setHomeStage("scan");
                        setIsMenuOpen(false);
                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white cursor-pointer"
                >
                    <BsUpcScan className="size-30 text-white" />
                    SCAN PRODUCT
                </div>
                <div className="flex w-full h-full"></div>
                <div className="flex flex-col justify-center items-center w-full h-full text-white">
                    <GoSkipFill className="size-30 text-white" />
                    CANCEL PRODUCT
                </div>
                <div className="flex w-full h-full"></div>
            </div>
        </div>
    );

    const renderScanCard = () => {
        if (homeStage !== "scan") return null;

        return (
            <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-50 bg-black/20 backdrop-blur-sm">
                <div
                    ref={cardRef}
                    className="transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6"
                >
                    <div className="flex justify-center items-center w-full text-white">
                        Please enter Product ID :
                    </div>
                    <div className="flex justify-center items-center w-full text-white">
                        โปรดใส่รหัสผลิตภัณฑ์ของคุณ :
                    </div>
                    <div id="qr-reader" className="w-full h-60 rounded-lg bg-white my-4" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={productOrderNo}
                        id="product_id"
                        onChange={(e) => setProductOrderNo(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="product id..."
                    />
                    <div className="flex w-full h-full items-center">
                        <span className="flex w-1/2 h-32 justify-center">
                            <BsUpcScan className="size-32 text-white" />
                        </span>
                        <div
                            onClick={() => {
                                console.log("Scanned ID:", productOrderNo);
                                setHomeStage("home");
                                const query = encodeURIComponent(productOrderNo); // ป้องกันปัญหา URL พิเศษ
                                const query2 = encodeURIComponent(productOrderNo);
                                router.push(`/StatusPage?productOrderNo=${query}&ProductOrderNos=${query2}`);
                            }}

                            className="flex flex-col text-4xl font-bold justify-center items-center font-roboto w-1/2 size-32 bg-green-600 rounded-full cursor-pointer"
                        >
                            SUBMIT
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const rendercloseProdCard = () => {
        if (homeStage !== "closeprod") return null;

        return (
            <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-50 bg-black/20 backdrop-blur-sm">
                <div
                    ref={cardProdRef}
                    className="transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6"
                >
                    <div className="flex justify-center items-center w-full text-white">
                        Please enter Employee ID :
                    </div>
                    <div className="flex justify-center items-center w-full text-white">
                        โปรดใส่รหัสพนักงานของคุณ :
                    </div>
                    <div id="qr-reader" className="w-full h-60 rounded-lg bg-white my-4" />
                    <input
                        ref={inputProdRef}
                        type="text"
                        value={EmployeeNo}
                        id="Employee_id"
                        onChange={(e) => setEmployeeNo(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Employee id..."
                    />
                    <div className="flex w-full h-full items-center">
                        <span className="flex w-1/2 h-32 justify-center">
                            <BsUpcScan className="size-32 text-white" />
                        </span>
                        <div
                            onClick={() => {
                                console.log("Scanned ID:", EmployeeNo);
                                submitLogToReflow120_9_CLOSE();
                                updateReflowStatus();
                                setHomeStage("home");
                            }}

                            className="flex flex-col text-4xl font-bold justify-center items-center font-roboto w-1/2 size-32 bg-green-600 rounded-full cursor-pointer"
                        >
                            SUBMIT
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {homeStage === "home" && renderHomeButton()}
            {homeStage === "menuOpen" && renderMenu()}
            {homeStage === "scan" && renderScanCard()}
            {homeStage === "closeprod" && rendercloseProdCard()}


            <div className="absolute bottom-5 left-5 text-white">
                Position: {`X: ${position.x}, Y: ${position.y}`}
            </div>
        </>
    );
};

export default MenuToggle;
