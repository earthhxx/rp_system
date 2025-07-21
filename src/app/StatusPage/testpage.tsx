'use client';
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from 'next/navigation';
import StatusReader from '../components/UseParams';

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

    //fetch by productorder to .2
    const ismock120_2 = useState(false);
    const datamock120_2 = {
        "success": true,
        "data": {
            "productOrderNo": "202507130009",
            "productName": "15F5ST80600AOO",
            "ProcessLine": "SMT-2               "
        }
    }
    const [data120_2, setData120_2] = useState<DataItem120_2 | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!ProductOrderNo) return;

            try {
                const res = await fetch(`/api/120-2/scan-to-db-120-2?productOrderNo=${ProductOrderNo}`);
                const data = await res.json();

                if (!data || !data.data || data.success === false || data.error) {
                    alert("ข้อมูลไม่ถูกต้องหรือว่างเปล่า .2");
                    localStorage.removeItem("localProductOrderNo");
                    window.dispatchEvent(new Event("loscalProductOrderNo:removed"));
                    router.push('/');
                }

                if (ismock120_2) {
                    setData120_2(datamock120_2.data);
                } else {
                    setData120_2(data.data);
                }

            } catch (error) {
                alert(`Can't connect err:500`);
                localStorage.removeItem("localProductOrderNo");
                window.dispatchEvent(new Event("loscalProductOrderNo:removed"));
                router.push('/');
            }
        };

        fetchData();
    }, [ProductOrderNo]);

    //fetch data .9
    const [Data120_9, setData120_9] = useState<DataItem120_9 | null>(null);


    useEffect(() => {
        if (!data120_2) return;

        const fetchPdfData = async (): Promise<boolean> => {

            try {
                const res = await fetch(`/api/120-9/checkreflow/load-pdf-data?R_Line=${data120_2.ProcessLine}&R_Model=${data120_2.productName}`);
                const { data, success, message } = await res.json();

                if (!success || !data || !data.R_PDF || data.R_PDF === "null") {
                    alert("ไม่พบข้อมูล STANDARD PDF");
                    localStorage.removeItem("productOrderNo");
                    window.dispatchEvent(new Event("productOrderNo:removed"));
                    router.push('/');
                    return false;
                }

                const decoded = atob(data.R_PDF);
                if (!decoded.startsWith("%PDF-")) {
                    alert("ไม่พบข้อมูล STANDARD PDF");
                    localStorage.removeItem("productOrderNo");
                    window.dispatchEvent(new Event("productOrderNo:removed"));
                    router.push('/');
                    return false;
                }

                handleShowPdf(data.R_PDF);
                return true;

            } catch (err) {
                alert("ไม่พบข้อมูล STANDARD PDF");
                localStorage.removeItem("productOrderNo");
                window.dispatchEvent(new Event("productOrderNo:removed"));
                router.push('/');
                return false;
            }
        };

        //STAGE VALIDATION CHECK
        const fetchReflowStatus = async () => {
            try {
                const res = await fetch(`/api/120-9/checkreflow/select-REFLOW_Status?R_Line=${data120_2.ProcessLine}`);
                const { data, success } = await res.json();

                if (!success || !data || data.length === 0) {
                    alert("ไม่พบข้อมูล REFLOW Status");
                    localStorage.removeItem("productOrderNo");
                    window.dispatchEvent(new Event("productOrderNo:removed"));
                    router.push('/');
                    return;
                }

                const { ST_Status, ST_Prod } = data;
                const isProdMatch = ST_Prod === data120_2.productOrderNo;

                if ((!ST_Status || ST_Status === "null") && (!ST_Prod || ST_Prod === "null")) {
                    setSubmitStage("WAITING");
                    const pdfSuccess = await fetchPdfData();
                    if (pdfSuccess) {
                        submitLogToReflow120_9();
                        updateReflowStatus();
                    }
                } else if (ST_Status === "WAITING" && isProdMatch) {
                    setSubmitStage("WAITING");
                    setData120_9(data.data);
                    await fetchPdfData();
                } else if (ST_Status === "ONCHECKING" && isProdMatch) {
                    setSubmitStage("ONCHECKING");
                    setData120_9(data.data);
                    await fetchPdfData();
                } else if (ST_Status === "CHECKED" && isProdMatch) {
                    setSubmitStage("CHECKED");
                    setData120_9(data.data);
                    await fetchPdfData();
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

    //fecth employee from .2
    const [EmployeeName, setEmployeeName] = useState('');
    const [EmployeeUserName, setEmployeeUserName] = useState('');

    //input from client 
    const [EmployeeNoInput, setEmployeeNoInput] = useState('');
    useEffect(() => {
        const fetchEmployeeName = async () => {
            const res = await fetch(`/api/120-2/select-Employee-id?UserName=${EmployeeNoInput}`);
            const { success, data } = await res.json();

            if (success && data?.Name && data?.UserName) {
                setEmployeeName(data.Name);
                setEmployeeUserName(data.UserName);
            }
        };

        if (EmployeeNoInput) fetchEmployeeName();
    }, [EmployeeNoInput]);

    //Stage
    const [submitStage, setSubmitStage] = useState<"WAITING" | "ONCHECKING" | "CHECKED">("WAITING");

    //update status
    const updateReflowStatus = async () => {
        const res = await fetch('/api/120-9/checkreflow/update-REFLOW_Status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ST_Line: data120_2?.ProcessLine,
                ST_Model: data120_2?.productName,
                ST_Prod: ProductOrderNo,
                ST_Status: submitStage,
            })
        });
    };

    //submit log state
    const submitLogToReflow120_9 = async () => {
        if (!data120_2 || !submitStage) {
            alert("Missing required fields to submit log");
            return;
        }

        try {
            const payload = {
                R_Line: data120_2.ProcessLine,
                R_Model: data120_2.productName,
                productOrderNo: ProductOrderNo,
                ST_Status: submitStage

            };

            const res = await fetch('/api/120-9/checkreflow/insert-REFLOW_log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                alert("Log !res !reult :");
            } else {
            }

        } catch (error) {
            alert("Error submitting log:");
        }
    };

    //pdf
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    // 👉 ฟังก์ชันแปลง base64 → blob → objectURL
    const handleShowPdf = (base64: string) => {
        try {
            if (base64) {
                const binary = atob(base64);
                const len = binary.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                const dataUri = `data:application/pdf;base64,${bytes}`;
                setPdfUrl(dataUri);
            }


        } catch (err) {
            alert("เกิดข้อผิดพลาดขณะแปลง PDF");
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-blue-100">
            <StatusReader onGetproductOrderNo={setProductOrderNo} />

        </div>
    )
}

export default PageStatus;