'use client';
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import StatusReader from '../components/UseParams';

//icons
import { MdKeyboardArrowDown } from "react-icons/md";
import { GoSkipFill, GoCheckCircle } from "react-icons/go";
import { FaFilePdf } from "react-icons/fa6";

type DataItem120_2 = {
    productOrderNo: string;
    productName: string;
    ProcessLine: string;
};

const PageStatus = () => {
    const router = useRouter();
    const [submitStage, setSubmitStage] = useState<"WAITING" | "ONCHECKING" | "CHECKED">("WAITING");

    //param
    const [ProductOrderNo, setProductOrderNo] = useState<string | null>(null);

    //data120_2
    const [data120_2, setData120_2] = useState<DataItem120_2 | null>(null);

    //ภาพ PNG base64 array จาก API
    const [pdfImages, setPdfImages] = useState<string[]>([]);

    //fetch data120_2
    useEffect(() => {
        const fetchData = async () => {
            if (!ProductOrderNo) return;

            try {
                const res = await fetch(`/api/120-2/scan-to-db-120-2?productOrderNo=${ProductOrderNo}`);
                const data = await res.json();

                if (!data || !data.data || data.success === false || data.error) {
                    alert("ข้อมูลไม่ถูกต้องหรือว่างเปล่า .2");
                    localStorage.removeItem("localProductOrderNo");
                    window.dispatchEvent(new Event("localProductOrderNo:removed"));
                    router.push('/');
                    return;
                }

                setData120_2(data.data);

            } catch (error) {
                alert(`Can't connect err:500`);
                localStorage.removeItem("localProductOrderNo");
                window.dispatchEvent(new Event("localProductOrderNo:removed"));
                router.push('/');
            }
        };

        fetchData();
    }, [ProductOrderNo]);

    //fetch .9 และโหลดรูปภาพแทน PDF
    useEffect(() => {
        if (!data120_2) return;

        const fetchPdfImages = async (): Promise<boolean> => {
            try {
                const res = await fetch(`/api/120-9/checkreflow/load-pdf-standard?R_Line=${encodeURIComponent(data120_2.ProcessLine)}&R_Model=${encodeURIComponent(data120_2.productName)}`);
                const json = await res.json();

                if (!json.success || !json.images || json.images.length === 0) {
                    alert("ไม่พบข้อมูล STANDARD PDF (รูปภาพ)");
                    localStorage.removeItem("productOrderNo");
                    window.dispatchEvent(new Event("productOrderNo:removed"));
                    router.push('/');
                    return false;
                }

                setPdfImages(json.images); // json.images คือ array ของ base64 image string
                return true;
            } catch (err) {
                alert("ไม่พบข้อมูล STANDARD PDF (รูปภาพ)");
                localStorage.removeItem("productOrderNo");
                window.dispatchEvent(new Event("productOrderNo:removed"));
                router.push('/');
                return false;
            }
        };

        // STAGE VALIDATION CHECK (เดิม)
        const fetchReflowStatus = async () => {
            try {
                const res = await fetch(`/api/120-9/checkreflow/select-REFLOW_Status?R_Line=${encodeURIComponent(data120_2.ProcessLine)}`);
                const { data, success } = await res.json();

                if (!success || !data || data.length === 0) {
                    alert("ไม่พบข้อมูล REFLOW Status");
                    localStorage.removeItem("productOrderNo");
                    window.dispatchEvent(new Event("productOrderNo:removed"));
                    router.push('/');
                    return;
                }

                // สมมติ data เป็น object เดียว (แก้ตามจริงถ้าไม่ใช่)
                const { ST_Status, ST_Prod } = data;

                const isProdMatch = ST_Prod === data120_2.productOrderNo;

                if ((!ST_Status || ST_Status === "null") && (!ST_Prod || ST_Prod === "null")) {
                    //setSubmitStage("WAITING");
                    const pdfSuccess = await fetchPdfImages();
                    if (pdfSuccess) {
                        //submitLogToReflow120_9();
                        //updateReflowStatus();
                    }
                } else if (ST_Status === "WAITING" && isProdMatch) {
                    //setSubmitStage("WAITING");
                    //setData120_9(data.data);
                    await fetchPdfImages();
                } else if (ST_Status === "ONCHECKING" && isProdMatch) {
                    //setSubmitStage("ONCHECKING");
                    //setData120_9(data.data);
                    await fetchPdfImages();
                } else if (ST_Status === "CHECKED" && isProdMatch) {
                    //setSubmitStage("CHECKED");
                    //setData120_9(data.data);
                    await fetchPdfImages();
                } else {
                    alert(`เลข productionOrderNo ไม่ตรง หรือ สถานะไม่ถูกต้อง หรือ มี pro ข้างอยู่แล้ว`);
                    localStorage.removeItem("productOrderNo");
                    window.dispatchEvent(new Event("productOrderNo:removed"));
                    router.push('/');
                }
            } catch (err) {
                alert(`โหลด REFLOW Status ล้มเหลว: ${err}`);
                localStorage.removeItem("productOrderNo");
                window.dispatchEvent(new Event("productOrderNo:removed"));
                router.push('/');
            }
        };

        fetchReflowStatus();

    }, [data120_2]);


    const [arrowdownbuttoncard, setArrowDownButtoncard] = useState(false);
    const [arrowdownbutton, setArrowDownButton] = useState(true);
    const cardarrowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutsidearrow = (event: MouseEvent) => {
            if (cardarrowRef.current && !cardarrowRef.current.contains(event.target as Node)) {
                setArrowDownButtoncard(false);
                setArrowDownButton(true);

            }
        };
        if (arrowdownbuttoncard) {
            document.addEventListener("mousedown", handleClickOutsidearrow);
        } else {
            document.removeEventListener("mousedown", handleClickOutsidearrow);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutsidearrow);
        };
    }, [arrowdownbuttoncard]);


    const arrowcard = () => {
        return (
            <>
                <div className="fixed mt-20 flex w-full flex-row justify-center items-center z-49">
                    <div
                        ref={cardarrowRef}
                        className="content-center-safe m-4 w-[110px] xl:w-[150px] h-[30px] xl:h-[60px] text-[10px] justify-center items-center rounded-4xl bg-gray-800/70 backdrop-blur-md"
                    >
                        <div className="flex flex-none h-5 xl:h-10"></div>
                        <div className="flex flex-row justify-center items-center ">
                            <div className="flex w-full h-full justify-center">
                                <div className="flex flex-none"></div>
                                <div
                                    onClick={() => {
                                        // setArrowDownButtoncard(false);
                                        // setisCardOpencancel(true);
                                    }}
                                    className="flex flex-col justify-center items-center font-kanit text-white cursor-pointer"
                                >
                                    <div className="flex flex-none"></div>
                                    <GoSkipFill className="w-6 h-6 xl:w-8 xl:h-8 text-white" />
                                    <div>CANCEL PRODUCT</div>
                                    <div>ยกเลิก โปรไฟล์</div>
                                </div>
                                <div className="flex flex-none"></div>
                            </div>
                            {submitStage === "CHECKED" && (
                                <>
                                    <div className="flex w-full h-full justify-center">
                                        <div className="flex flex-none"></div>
                                        <div
                                            onClick={() => {
                                                // setArrowDownButtoncard(false);
                                                // setisCardOpenclosepro(true);
                                            }}
                                            className="flex flex-col justify-center items-center font-kanit text-white cursor-pointer"
                                        >
                                            <div className="flex flex-none"></div>
                                            <GoCheckCircle className="w-6 h-6 xl:w-8 xl:h-8 text-white" />
                                            <div>SUBMIT PRODUCT</div>
                                            <div>สำเร็จการวัดโปรไฟล์</div>
                                        </div>
                                        <div className="flex flex-none"></div>
                                    </div>
                                    <div className="flex w-full h-full justify-center">
                                        <div className="flex flex-none"></div>
                                        <div
                                            onClick={() => {
                                                // setArrowDownButtoncard(false);
                                                // setArrowDownButton(true);
                                                // handleOpenPdf();
                                            }}
                                            className="flex flex-col justify-center items-center font-kanit text-white cursor-pointer"
                                        >
                                            <div className="flex flex-none"></div>
                                            <FaFilePdf className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
                                            <div>RESULT</div>
                                            <div>ผลการวัดโปรไฟล์</div>
                                        </div>
                                        <div className="flex flex-none"></div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex-none h-10"></div>
                    </div>
                </div>
            </>
        );
    };



    const [statusCard, setstatusCard] = useState(false);

    return (
        <div className="flex flex-col h-screen w-full bg-blue-100">
            <StatusReader onGetproductOrderNo={setProductOrderNo} />
            <div className="flex">
                {/* แสดงรูปภาพ PNG ที่ได้จาก backend */}
                <div className="flex flex-col w-full h-full items-center p-4 space-y-4 overflow-auto max-h-[100vh]">
                    {pdfImages.length === 0 && <p>กำลังโหลดภาพ...</p>}
                    {pdfImages.map((src, idx) => (
                        <img
                            key={idx}
                            src={src}
                            alt={`Page ${idx + 1}`}
                            className="max-w-full h-full shadow-md border border-gray-300 rounded"
                        />
                    ))}
                </div>
                {/* แสดงรูปภาพ PNG ที่ได้จาก backend */}
                <div className="flex flex-col w-full h-full items-center p-4 space-y-4 overflow-auto max-h-[100vh]">
                    {pdfImages.length === 0 && <p>กำลังโหลดภาพ...</p>}
                    {pdfImages.map((src, idx) => (
                        <img
                            key={idx}
                            src={src}
                            alt={`Page ${idx + 1}`}
                            className="max-w-full h-full shadow-md border border-gray-300 rounded"
                        />
                    ))}
                </div>
            </div>

            {arrowdownbutton && (
                <div className="fixed mt-16 mr-4 z-49 flex w-full justify-end right-10">
                    <div
                        onClick={() => {
                            setArrowDownButtoncard(true);
                            setArrowDownButton(false);
                        }}
                        className="flex flex-none ">
                        <MdKeyboardArrowDown
                            className="size-12 rounded-full bg-gray-800/70 backdrop-blur-md text-white" />
                    </div>
                </div>
            )}
            {arrowcard && (
                arrowcard()
            )}

        </div>
    );
};

export default PageStatus;
