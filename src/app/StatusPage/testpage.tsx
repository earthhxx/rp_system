'use client';
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from 'next/navigation';
import StatusReader from '../components/UseParams';

type DataItem120_2 = {
    productOrderNo: string;
    productName: string;
    ProcessLine: string;
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
    const [data120_2, setData120_2] = useState<DataItem120_2 | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!ProductOrderNo) return;

            try {
                const res = await fetch(`/api/120-2/scan-to-db-120-2?productOrderNo=${ProductOrderNo}`);
                const data = await res.json();


                if (!data || !data.data || data.success === false || data.error) {
                    alert("ข้อมูลไม่ถูกต้องหรือว่างเปล่า");
                    localStorage.removeItem("productOrderNo");
                    window.dispatchEvent(new Event("productOrderNo:removed"));
                    router.push('/');
                }

                setData120_2(data.data);
            } catch (error) {
                alert(`api ผิดพลาด`);
                localStorage.removeItem("productOrderNo");
                window.dispatchEvent(new Event("productOrderNo:removed"));
                router.push('/');
            }
        };

        fetchData();
    }, [ProductOrderNo]);

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


    return (
        <div className="flex flex-col h-screen w-full bg-blue-100">
            <StatusReader onGetproductOrderNo={setProductOrderNo} />
        
        </div>
    )
}

export default PageStatus;