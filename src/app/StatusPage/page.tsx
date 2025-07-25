'use client';
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import StatusReader from '../components/UseParams';

//icons
import { MdKeyboardArrowDown } from "react-icons/md";
import { GoSkipFill, GoCheckCircle } from "react-icons/go";
import { FaFilePdf } from "react-icons/fa6";
import { BsUpcScan } from "react-icons/bs";

type DataItem120_2 = {
    productOrderNo: string;
    productName: string;
    ProcessLine: string;
};

type DataItem120_9 = {
    ST_Line: string;
    ST_Model: string;
    ST_Prod: string;
    ST_Status: string;
    ST_EmployeeID: string;
};



function setJsonToLocalStorage<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("local-storage-change", { detail: { key, value } }));
}

function getJsonFromLocalStorage<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}


const PageStatus = () => {
    const router = useRouter();

    //param
    const [ProductOrderNo, setProductOrderNo] = useState<string | null>(null);

    //data120_2
    const [data120_2, setData120_2] = useState<DataItem120_2 | null>(null);

    //data120_9
    const [data120_9, setData120_9] = useState<DataItem120_9 | null>(null);

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
                const res = await fetch(`/api/120-9/checkreflow/load-pdf-standard?ST_Line=${encodeURIComponent(data120_2.ProcessLine)}&ST_Model=${encodeURIComponent(data120_2.productName)}`);
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
                const res = await fetch(`/api/120-9/checkreflow/select-REFLOW_Status?ST_Line=${encodeURIComponent(data120_2.ProcessLine)}`);
                const { data, success } = await res.json();

                if (!success || !data || data.length === 0) {
                    alert("ไม่พบข้อมูล REFLOW Status");
                    localStorage.removeItem("productOrderNo");
                    window.dispatchEvent(new Event("productOrderNo:removed"));
                    router.push('/');
                    return;
                }

                // สมมติ data เป็น object เดียว (แก้ตามจริงถ้าไม่ใช่)
                const { ST_Status, ST_Prod } = data[0];

                const isProdMatch = ST_Prod === data120_2.productOrderNo;

                if ((!ST_Status || ST_Status === "null") && (!ST_Prod || ST_Prod === "null")) {
                    setSubmitStage("WAITING");
                    const pdfSuccess = await fetchPdfImages();
                    if (pdfSuccess) {
                        //submitLogToReflow120_9();
                        updateReflowStatus("WAITING");
                    }
                } else if (ST_Status === "WAITING" && isProdMatch) {
                    setSubmitStage("WAITING");
                    setData120_9(data[0]);
                    await fetchPdfImages();
                } else if (ST_Status === "ONCHECKING" && isProdMatch) {
                    setSubmitStage("ONCHECKING");
                    setData120_9(data[0]);
                    await fetchPdfImages();
                } else if (ST_Status === "CHECKED" && isProdMatch) {
                    setSubmitStage("CHECKED");
                    setData120_9(data[0]);
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
                        className="content-center-safe m-4 w-[110px] xl:w-[150px] h-fit text-[10px] justify-center items-center rounded-4xl bg-gray-800/70 backdrop-blur-md"
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

    //submitcard
    const [submitStage, setSubmitStage] = useState<"WAITING" | "ONCHECKING" | "CHECKED">("WAITING");
    const [submitcard, setSubmitcard] = useState(false);
    const submitcardRef = useRef<HTMLDivElement>(null!);
    const inputRef = useRef<HTMLInputElement>(null!);

    const togglepassmodelbutton = () => {
        const modellocal = getJsonFromLocalStorage<string>('modellocal');
        const employeelocal = getJsonFromLocalStorage<string>('employeelocal');
        setEmployeeNo(employeelocal ? employeelocal.toString() : "");
        setpassmodelbutton(prev => !prev); // สลับสถานะ
    };
    const [passmodelbutton, setpassmodelbutton] = useState(false);
    const [confirmmodel, setconfirmmodel] = useState(false);
    const [confirmemployee, setconfirmemployee] = useState<string | null>(null);

    //LOAD Moldel from local
    useEffect(() => {
        if (data120_2) {
            const getmodel: string | null = getJsonFromLocalStorage('modellocal');
            const getemployee: string | null = getJsonFromLocalStorage('employeelocal');

            if (getmodel === data120_2.productName) {
                setconfirmmodel(true);
                setconfirmemployee(getemployee);
            } else {
                setconfirmmodel(false); // เผื่อเคส model ไม่ตรง
            }
        }
    }, [data120_2]);

    useEffect(() => {
        const handleClickOutsubmitcard = (event: MouseEvent) => {
            if (submitcardRef.current && !submitcardRef.current.contains(event.target as Node)) {
                setSubmitcard(false);
            }
        };
        if (submitcard) {
            document.addEventListener("mousedown", handleClickOutsubmitcard);
        } else {
            document.removeEventListener("mousedown", handleClickOutsubmitcard);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutsubmitcard);
        };
    }, [submitcard]);


    //allow employee
    const DataInArrayEmployee = ['0506', '0743', '0965', '3741', '1534', '1912', '2050', '3015', '3222', '3744', '3745'];

    //Employee .2
    const [EmployeeNo, setEmployeeNo] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [employeeUserName, setEmployeeUserName] = useState("");

    useEffect(() => {
        const fetchEmployeeName = async () => {
            const res = await fetch(`/api/120-2/select-Employee-id?UserName=${EmployeeNo}`);
            const { success, data } = await res.json();


            if (success && data?.Name && data?.UserName) {
                setEmployeeName(data.Name);
                setEmployeeUserName(data.UserName);
            }
        };

        if (EmployeeNo) fetchEmployeeName();
    }, [EmployeeNo]);

    const handleChangeInputID = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length === 4) {
            setEmployeeNo(e.target.value);
        }
    };


    //handle click submit state
    const handleNextPageStatusONCHECKING = () => {
        const value = inputRef.current?.value.trim();
        if (!value || value.length !== 4) {
            alert("กรุณากรอกรหัสให้ครบก่อนเข้าสู่หน้าถัดไป");
            return;
        }
        if (EmployeeNo === employeeUserName) {
            if (submitStage === "WAITING") {
                const newStage = "ONCHECKING";
                setSubmitStage(newStage);
                updateReflowStatus(newStage); // ส่งค่าที่จะใช้จริง
                setJsonToLocalStorage("modellocal", data120_2?.productName);
                setJsonToLocalStorage("employeelocal", EmployeeNo);
                setSubmitcard(false);
            }
            else {
                alert('รหัสไม่มีอยู่ในฐานข้อมูล');
            }
        }
        else {
            alert("รหัสพนักงานไม่ตรงกับผู้ใช้ที่เข้าสู่ระบบ");
        }
    };

    const handleNextPageStatusCHECKED = () => {
        const value = EmployeeNo;
        if (!value && DataInArrayEmployee.includes(confirmemployee?.toString() || "")) {

        }
        else if (value) {
        }
        else {
            alert("กรุณากรอกหรือสแกนรหัสก่อนเข้าสู่หน้าถัดไป");
            return;
        }
        if (EmployeeNo === employeeUserName) {
            if (submitStage === "ONCHECKING") {
                const newStage = "CHECKED";
                setSubmitStage(newStage);
                // submitLogToReflow120_9_CHECK();
                updateReflowStatus(newStage);
                setJsonToLocalStorage('modellocal', (data120_2?.productName));
                setJsonToLocalStorage('employeelocal', (EmployeeNo));
            }
            else if (submitStage === "WAITING") {
                const newStage = "CHECKED";
                setSubmitStage(newStage);
                // submitLogToReflow120_9_CHECK(); continuous
                updateReflowStatus(newStage);
                setJsonToLocalStorage('modellocal', (data120_2?.productName));
                setJsonToLocalStorage('employeelocal', (EmployeeNo));
            }
            else {
                clearinputref();
            }
        }
        else {
            alert("รหัสพนักงานไม่ตรงกับผู้ใช้ที่เข้าสู่ระบบ");

        }
    };

    //state update
    const updateReflowStatus = async (stage: "WAITING" | "ONCHECKING" | "CHECKED") => {
        const res = await fetch('/api/120-9/checkreflow/update-REFLOW_Status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ST_Line: data120_2?.ProcessLine,
                ST_Model: data120_2?.productName,
                ST_Prod: ProductOrderNo,
                ST_Status: stage, // ใช้ค่าที่ส่งมา
            })
        });
    };

    //submit log state to check
    const submitLogToReflow120_9_ONCHECKING = async () => {
        if (!data120_2 || !submitStage) {
            alert("Missing required fields to submit log");
            return;
        }

        try {
            const payload = {
                R_Line: data120_2.ProcessLine,
                R_Model: data120_2.productName,
                productOrderNo: ProductOrderNo,
                ST_Status: submitStage,
                Log_User: employeeName,
                Log_UserID: EmployeeNo,
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

    const clearinputref = () => {
        // เคลียร์ inputRef และ state
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

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
            {arrowdownbuttoncard && (
                arrowcard()
            )}


            {submitStage === "WAITING" && (
                <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-45">
                    <div className="flex w-full h-[30%] bg-yellow-400/50 mt-20">
                        <div className="w-full">
                            {data120_9?.ST_Line || "ไม่มีข้อมูล R_Line"}
                        </div>
                        <div onClick={() => { setSubmitcard(true); }} className="flex justify-center items-center w-[40%] bg-yellow-400/80">
                            <div className="flex flex-col justify-center items-center w-86">
                                <div className="flex flex-col justify-center items-center">
                                    <div className="font-roboto font-bold text-[25px] mb-6">Waiting for Measurement</div>
                                    <svg
                                        className="size-24 animate-spin text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                        />
                                    </svg>
                                    <div className="font-kanit ps-4 pe-4 font-bold text-[25px] mt-6">..รอวัดโปรไฟล์..</div>
                                </div>
                                <div className="w-full text-[20px] text-black backdrop-blur-md rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {submitStage === "ONCHECKING" && (
                <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-45">
                    <div className="flex w-full h-[30%] bg-blue-400/50 mt-20">
                        <div className="w-full">
                            {data120_9?.ST_Line || "ไม่มีข้อมูล R_Line"}
                        </div>
                        <div onClick={() => { setSubmitcard(true); }} className="flex justify-center items-center w-[40%] bg-blue-400/80">
                            <div className="flex flex-col justify-center items-center w-86">
                                <div className="flex flex-col justify-center items-center">
                                    <div className="font-roboto font-bold text-[27px] mb-6 uppercase">..Onchecking..</div>
                                    <svg
                                        className="size-24 animate-spin text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                        />
                                    </svg>
                                    <div className="font-kanit ps-4 pe-4 font-bold text-[25px] mt-6">..กำลังวัดโปรไฟล์..</div>
                                </div>
                                <div className="w-full text-[20px] text-black backdrop-blur-md rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {submitStage === "CHECKED" && (
                <div className="fixed flex flex-col justify-center items-center z-40 w-full h-[5%]">
                    {/* Header Box */}
                    <div className="flex h-full w-full bg-gradient-to-r from-blue-800 to-blue-700 backdrop-blur-lg drop-shadow-2xl items-center justify-center">
                        {/* Box1 */}
                        <div className="flex flex-col max-h-full justify-center items-center">
                            {/* Row2 */}
                            <div className="flex w-full text-xl text-center justify-center items-center pe-4 ps-4">
                                <div className="font-roboto text-2xl text-white w-full font-bold">{data120_2?.productName}</div>
                            </div>
                        </div>
                        {/* Box2 */}
                        <div className="flex h-full items-center justify-center">
                            <button
                                // onClick={() => setIsCardOpen(true)}
                                type="button"
                                className={`flex size-15 items-center px-4 py-2 transition-all duration-300 `}
                            >
                                <svg
                                    className="w-20 h-20"
                                    viewBox="0 0 56 56"
                                >
                                    {/* วงกลม */}
                                    <circle
                                        className="check-circle "
                                        cx="26"
                                        cy="26"
                                        r="23"
                                        fill="none"
                                        stroke="#4ade80"
                                        strokeWidth="4"
                                    />
                                    {/* เครื่องหมายถูก */}
                                    <path
                                        className="check-mark"
                                        fill="none"
                                        stroke="#4ade80"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M14 27 L22 35 L38 19"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {submitcard && submitStage === 'WAITING' && (
                <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-45 bg-black/20 backdrop-blur-sm">
                    <div ref={submitcardRef} className="text-[14px] xl:text-xl transition-all duration-300 scale-100 opacity-100 flex flex-col size-110 gap-4 xl:size-160 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl p-6">
                        <div className="flex justify-center items-center w-full text-white">Please enter your Employee ID :</div>
                        <div className="flex justify-center items-center w-full text-white">โปรดใส่รหัสพนักงานของคุณ : </div>
                        <div className="flex justify-center items-center w-full text-white">PLEASE CHECK YOUR ID ('ตรวจสอบข้อมูลของคุณ') = {employeeName || "ไม่มีข้อมูล"} </div>
                        <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
                        <input
                            ref={inputRef}
                            type="password"
                            autoComplete="off"
                            onChange={handleChangeInputID}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="รหัสพนักงาน"
                        />
                        <div className="flex flex-row w-full justify-center items-center">
                            <div className="flex flex-col items-center">
                                <div className="flex justify-center items-center  text-white">continuously or not?</div>
                                <div className="flex justify-center items-center  text-white">รันงานต่อเนื่องหรือไม่</div>
                            </div>
                            <div className="flex flex-none w-[5%]"></div>
                            <button
                                onClick={() => {
                                    togglepassmodelbutton();
                                }}
                                className={`px-4 py-2 size-10 xl:size-20  rounded-full ${passmodelbutton ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
                                    }`}
                            >
                                <pre className="text-[10px] xl:text-xl">
                                    {passmodelbutton ? 'YES\nใช่' : 'NO\nไม่'}
                                </pre>
                            </button>
                        </div>

                        <div className="flex w-full h-full items-center">
                            <div className="flex flex-col text-white justify-center items-center font-kanit w-1/2">
                                <BsUpcScan className="size-15 xl:size-32 text-white"></BsUpcScan>
                                <div>SCAN</div>
                                <div>สแกน</div>
                            </div>
                            <div
                                onClick={() => {
                                    if (passmodelbutton === true) {
                                        if (confirmmodel === true && DataInArrayEmployee.includes(confirmemployee?.toString() || "")) {
                                            handleNextPageStatusCHECKED();
                                            clearinputref();
                                        }
                                        else {
                                            alert('Model is not match lastest Model or user not allow')
                                            clearinputref();
                                        }
                                    }
                                    else if (passmodelbutton === false && DataInArrayEmployee.includes(EmployeeNo)) {
                                        handleNextPageStatusONCHECKING();
                                        clearinputref();
                                    }
                                    else {
                                        alert('Please Check your ID and try again \n กรุณาเช็ค ID และลองใหม่อีกครั้ง')
                                        clearinputref();
                                    }
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
            )}
            {submitcard && submitStage === 'ONCHECKING' && (
                <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-45 bg-black/20 backdrop-blur-sm">
                    <div ref={submitcardRef} className="text-[14px] xl:text-xl transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl p-6">
                        <div className="flex justify-center items-center w-full text-white">Please enter your Employee ID :</div>
                        <div className="flex justify-center items-center w-full text-white">โปรดใส่รหัสพนักงานของคุณ : </div>
                        <div className="flex justify-center items-center w-full text-white">PLEASE CHECK YOUR ID ('ตรวจสอบข้อมูลของคุณ') = {employeeName || "ไม่มีข้อมูล"} </div>
                        <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
                        <input
                            ref={inputRef}
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
                                    if (DataInArrayEmployee.includes(EmployeeNo)) {
                                        handleNextPageStatusCHECKED();
                                        clearinputref();
                                    }
                                    else {
                                        alert('Please Check your ID and try again \n กรุณาเช็ค ID และลองใหม่อีกครั้ง')
                                        clearinputref();
                                    }
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
            )}
        </div>
    );
};

export default PageStatus;
