'use client';
import React, { useState, useRef, useEffect, Suspense } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";

import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { GoSkipFill, GoCheckCircle } from "react-icons/go";
import { BsUpcScan } from "react-icons/bs";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useRouter } from 'next/navigation';
import { FaFilePdf } from "react-icons/fa6";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaHandPointDown } from "react-icons/fa";
import StatusReader from '../components/UseParams';
import EmployeeIdCard from "../components/EmployeeIdCard";

type DataItem120_2 = {
  productOrderNo: string;
  productName: string;
  ProcessLine: string;
};

type Datamock120_2 = {
  productOrderNo: string;
  productName: string;
  ProcessLine: string;
};

type DataItem120_9 = {
  R_Model: string;
  R_Line: string;
  R_PDF: string;
};

type DataItem120_9_Status = {
  ST_Line: string;
  ST_Model: string;
  ST_Prod: string;
  ST_Status: string;
  ST_EmployeeID: string;
};

type DataItem120_9_Result = {
  R_PDF2: string;
  base64: string;
};

function setJsonToLocalStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("local-storage-change", { detail: { key, value } }));
}

function getJsonFromLocalStorage<T>(key: string): T | null {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}



//api if !datalocal check status = ??? else back to layout
const checkreflowpage = () => {
  const props = { base64: "someBase64String" };
  const { base64 } = props;
  const [ProductOrderNo, setProductOrderNo] = useState<string | null>(null);

  const [showAlert, setshowAlert] = useState(false);
  const [alertData, setAlertData] = useState("");

  const DataInArrayEmployee = ['0506', '0743', '0965', '3741', '1534', '1912', '2050', '3015', '3222', '3744', '3745'];

  const [pdfUrl2, setPdfUrl2] = useState<string | null>(null);
  const router = useRouter();
  const goToHome = () => {
    router.push('/');
  };
  const togglepassmodelbutton = () => {
    setpassmodelbutton(prev => !prev); // สลับสถานะ
  };
  const [passmodelbutton, setpassmodelbutton] = useState(false);

  const [confirmmodel, setconfirmmodel] = useState(false);
  const [confirmemployee, setconfirmemployee] = useState<string | null>(null);

  const [pdfWarning, setPdfWarning] = useState("");
  const [pdfWarning2, setPdfWarning2] = useState("");
  const [isLoading120_9, setIsLoading120_9] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null!);
  const inputRef = useRef<HTMLInputElement>(null!);
  const cardRefcancel = useRef<HTMLDivElement>(null!);
  const cardRefClosepro = useRef<HTMLInputElement>(null!);

  const [isCardOpen, setIsCardOpen] = useState(false);

  const [showBar, setShowBar] = useState(true);
  const [submitStage, setSubmitStage] = useState<"WAITING" | "ONCHECKING" | "CHECKED">("WAITING");
  const [showChecked, setShowChecked] = useState(true);
  const [EmployeeNo, setEmployeeNo] = useState("");
  const [isPdfOpen, setPdfOpen] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);


  const [topper, setTopper] = useState(false);

  const [arrowdownbuttoncard, setArrowDownButtoncard] = useState(false);
  const [arrowdownbutton, setArrowDownButton] = useState(true);
  const cardarrowRef = useRef<HTMLDivElement>(null);



  const [isCardOpencancel, setisCardOpencancel] = useState(false);


  const [isCardOpenclosepro, setisCardOpenclosepro] = useState(false);
  

  const [isCardOpenONCHECKING, setisCardOpenONCHECKING] = useState(false);
  const cardRefONCHECKING = useRef<HTMLInputElement>(null);

  const zoomPluginInstance = zoomPlugin();
  const [data120_2, setData120_2] = useState<DataItem120_2 | null>(null);
  const [isLoading120_2, setIsLoading120_2] = useState(true);
  const [data120_9, setData120_9] = useState<DataItem120_9 | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [statusData120_9, setStatusData120_9] = useState<DataItem120_9_Status | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeUserName, setEmployeeUserName] = useState("");




  const handleShowPdf2 = (base64: string) => {
    try {
      const dataUri = `data:application/pdf;base64,${base64}`;
      setPdfUrl2(dataUri);
    } catch (err) {
      alert("❌ Failed to convert base64 to data URI:");
      setPdfWarning2("เกิดข้อผิดพลาดขณะแปลง PDF");
    }
  };
  const handleOpenPdf = async () => {
    setPdfOpen((prev) => !prev);
    if (!isPdfOpen) {
      await fetchPdfData2();
    }
  };



  //LOAD Moldel from local
  useEffect(() => {
    if (data120_2) {
      const getmodel: string | null = getJsonFromLocalStorage('modellocal');
      const getemployee: string | null = getJsonFromLocalStorage('employeelocal');

      if (getmodel === data120_2.productName) {
        setconfirmmodel(true);
        setconfirmemployee(getemployee);

      } else {
        alert('Model is not match');
        setconfirmmodel(false); // เผื่อเคส model ไม่ตรง
      }
    }
  }, [data120_2]);


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


  const fetchPdfData2 = async () => {

    try {
      if (!data120_2?.ProcessLine || !data120_2?.productName) {
        alert("⛔ พารามิเตอร์ไม่ครบ ไม่โหลด PDF")

        setPdfWarning2("⛔ พารามิเตอร์ไม่ครบ ไม่โหลด PDF");
        return;
      }

      const res = await fetch(
        `/api/120-9/checkreflow/load-pdf-data2?R_Line=${data120_2.ProcessLine}&R_Model=${data120_2.productName}`
      );
      const { data } = await res.json();


      if (data?.R_PDF2) {
        const decoded = atob(data.R_PDF2);
        if (decoded.startsWith('%PDF-') || decoded.startsWith('JVBER')) {
          handleShowPdf2(data.R_PDF2);
        } else {
          alert("PDF2 format ผิดพลาด");

          setPdfWarning2('PDF2 format ผิดพลาด');

        }
      } else if (!data || data.R_PDF2 === "null" || "undifined") {
        setshowAlert(true);
        setAlertData("ยังไม่มีการอัพโหลดผลการวัดโปรไฟล์");

        setPdfWarning2('ยังไม่มีการอัพโหลด PDF2');
      } else {
        alert("ยังไม่มีการอัพโหลด PDF2 error 2");

        setPdfWarning2('ยังไม่มีการอัพโหลด PDF2');

      }
    } catch (err) {
      alert("โหลด PDF2 ผิดพลาด");

      setPdfWarning2("เกิดข้อผิดพลาดระหว่างโหลด PDF");
    }
  };



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
        ST_Status: "WAITING"
      })
    });
  };

  const updateReflowStatusCHECKED = async () => {
    const res = await fetch('/api/120-9/checkreflow/update-REFLOW_Status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ST_Line: data120_2?.ProcessLine,
        ST_Model: data120_2?.productName,
        ST_Prod: ProductOrderNo,
        ST_Status: "CHECKED",
        ST_EmployeeID: EmployeeNo,
      })
    });
  };

  const updateReflowStatusONCHECKING = async () => {
    const res = await fetch('/api/120-9/checkreflow/update-REFLOW_Status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ST_Line: data120_2?.ProcessLine,
        ST_Model: data120_2?.productName,
        ST_Prod: ProductOrderNo,
        ST_Status: "ONCHECKING",
        ST_EmployeeID: EmployeeNo,
      })
    });
  };

  const updateReflowStatusCancel = async () => {
    const res = await fetch('/api/120-9/checkreflow/update-REFLOW_Status_cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ST_Line: data120_2?.ProcessLine
      })

    });

    const result = await res.json();

  };

  const updateReflowStatusClosepro = async () => {
    const res = await fetch('/api/120-9/checkreflow/update-REFLOW_Status_Closeprod', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ST_Line: data120_2?.ProcessLine
      })
    });
  };

  //ONCHECKING
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
        ST_Status: "ONCHECKING",
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

  //submit log state to waiting
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


  //submit log state to check
  const submitLogToReflow120_9_CHECK = async () => {
    if (!data120_2 || !submitStage) {
      alert("Missing required fields to submit log");
      return;
    }
    try {
      const payload = {
        R_Line: data120_2.ProcessLine,
        R_Model: data120_2.productName,
        productOrderNo: ProductOrderNo,
        ST_Status: "CHECKED",
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

      } else {

      }

    } catch (error) {
      alert("Error submitting log:");
    }
  };

  //submit log state to check
  const submitLogToReflow120_9_continuous = async () => {
    if (!data120_2 || !submitStage) {
      alert("Missing required fields to submit log");
      return;
    }

    try {
      const payload = {
        R_Line: data120_2.ProcessLine,
        R_Model: data120_2.productName,
        productOrderNo: ProductOrderNo,
        ST_Status: "CONTINUOUS",
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
      alert("Error submitting log");
    }
  };

  // //submit log state to cancel
  const submitLogcancelToReflow120_9 = async () => {
    if (!data120_2 || !submitStage) {
      alert("Missing required fields to submit log");
      return;
    }

    try {
      const payload = {
        R_Line: data120_2.ProcessLine,
        R_Model: data120_2.productName,
        productOrderNo: ProductOrderNo,
        ST_Status: 'Cancel',
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

  // //submit log state to cancel
  const submitLogCloseprodToReflow120_9 = async () => {
    if (!data120_2 || !submitStage) {
      alert("Missing required fields to submit log");
      return;
    }

    try {
      const payload = {
        R_Line: data120_2.ProcessLine,
        R_Model: data120_2.productName,
        productOrderNo: ProductOrderNo,
        ST_Status: 'close',
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

  useEffect(() => {
    if (base64) {
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      handleShowPdf(base64); // ใช้ function ที่คุณเขียนไว้แล้ว
    }
  }, [base64]);

  // Fetching Data 120-2

  useEffect(() => {

    const fetchData = async () => {
      if (!ProductOrderNo) return;
      setIsLoading120_2(true);

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
      } finally {
        setIsLoading120_2(false);
      }
    };

    fetchData();
  }, [ProductOrderNo]);

  //.9
  //datamock120_2

  const datamock120_2 = {
    "success": true,
    "data": {
      "productOrderNo": "202507130009",
      "productName": "15F5ST80600AOO",
      "ProcessLine": "SMT-2               "
    }
  }

  useEffect(() => {
    if (!data120_2) return;

    const fetchPdfData = async (): Promise<boolean> => {
      setIsLoading120_9(true);
      setPdfWarning('');
      setPdfUrl(null);

      try {
        const res = await fetch(`/api/120-9/checkreflow/load-pdf-data?R_Line=${data120_2.ProcessLine}&R_Model=${data120_2.productName}`);
        const { data, success, message } = await res.json();

        if (!success || !data || !data.R_PDF || data.R_PDF === "null") {
          setPdfWarning(message || 'ไม่พบข้อมูลจาก API');
          alert("ไม่พบข้อมูล STANDARD PDF");
          localStorage.removeItem("productOrderNo");
          window.dispatchEvent(new Event("productOrderNo:removed"));
          router.push('/');
          return false;
        }

        const decoded = atob(data.R_PDF);
        if (!decoded.startsWith("%PDF-")) {
          setPdfWarning("ไม่พบไฟล์ PDF หรือข้อมูลไม่ถูกต้อง");
          alert("ไม่พบข้อมูล STANDARD PDF");
          localStorage.removeItem("productOrderNo");
          window.dispatchEvent(new Event("productOrderNo:removed"));
          router.push('/');
          return false;
        }

        handleShowPdf(data.R_PDF);
        setData120_9(data);
        return true;

      } catch (err) {
        setPdfWarning("เกิดข้อผิดพลาดระหว่างโหลด PDF");
        alert("ไม่พบข้อมูล STANDARD PDF");
        localStorage.removeItem("productOrderNo");
        window.dispatchEvent(new Event("productOrderNo:removed"));
        router.push('/');
        return false;
      } finally {
        setIsLoading120_9(false);
      }
    };


    //STAGE VALIDATION CHECK
    const fetchReflowStatus = async () => {
      try {
        const res = await fetch(`/api/120-9/checkreflow/select-REFLOW_Status?R_Line=${data120_2.ProcessLine}`);
        const { data, success, message } = await res.json();

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
          await fetchPdfData();
        } else if (ST_Status === "ONCHECKING" && isProdMatch) {
          setSubmitStage("ONCHECKING");
          await fetchPdfData();
        } else if (ST_Status === "CHECKED" && isProdMatch) {
          setSubmitStage("CHECKED");
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


  // 👉 ฟังก์ชันแปลง base64 → blob → objectURL
  const handleShowPdf = (base64: string) => {
    try {
      const dataUri = `data:application/pdf;base64,${base64}`;
      setPdfUrl(dataUri);

    } catch (err) {
      setPdfWarning("เกิดข้อผิดพลาดขณะแปลง PDF");
    }
  };


  const startScan = async () => {
    const qrRegionId = "qr-reader";
    const html5QrCode = new Html5Qrcode(qrRegionId);
    scannerRef.current = html5QrCode;

    try {
      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {

        return;
      }

      // หากล้องที่ชื่อดูเหมือนกล้องหลัง
      const backCam = devices.find((d) =>
        d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("environment")
      );

      const selectedDeviceId = backCam ? backCam.id : devices[0].id;

      await html5QrCode.start(
        { deviceId: { exact: selectedDeviceId } },
        {
          fps: 10,
          qrbox: (vw, vh) => {
            const size = Math.min(vw, vh) * 0.8;
            return { width: size, height: size };
          },
        },
        (decodedText) => {
          setEmployeeNo(decodedText);
          if (inputRef.current) inputRef.current.value = decodedText;

          html5QrCode.stop().then(() => html5QrCode.clear());
        },
        (errorMessage) => {
          // 📌 คุณจะใส่ log, ignore หรือแจ้งเตือนก็ได้
          console.warn("QR Code scan error:", errorMessage);
        }
      );


      setTimeout(() => {
        const video = document.querySelector("#qr-reader video") as HTMLVideoElement;
        if (video) {
          video.style.width = "400px";
          video.style.height = "400px";
          video.style.borderRadius = "12px";
          video.style.objectFit = "cover";
        }
      }, 300);
    } catch (err) {

    }
  };

  const clearCamera = () => {
    if (scannerRef.current) {
      // ถ้าเป็น Html5Qrcode instance
      if ("stop" in scannerRef.current) {
        scannerRef.current
          .stop()      // หยุดกล้อง
          .then(() => scannerRef.current!.clear()) // ล้าง DOM และ memory
          .catch();
      }
      // ถ้าเป็น Html5QrcodeScanner instance
      else {
        (scannerRef.current as Html5QrcodeScanner)
          .clear()
          .then(() => {
            scannerRef.current = null;
          })
          .catch();
      }
    }
  };


  const clearinputref = () => {
    // เคลียร์ inputRef และ state
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleNextPageStatuscancel = async () => {
    const value = inputRef.current?.value.trim();
    if (!value) {
      alert("กรุณากรอกหรือสแกนรหัสก่อนเข้าสู่หน้าถัดไป");
      return;
    }

    if (EmployeeNo === employeeUserName) {
      try {
        setisLoading(true);
        await submitLogcancelToReflow120_9();
        await updateReflowStatusCancel();
        setisCardOpencancel(false);
        localStorage.removeItem("productOrderNo");
        window.dispatchEvent(new Event("productOrderNo:removed"));//แจ้ง component อื่นเพราะไม่ยิง STORAGE EVENT ใน layout

        goToHome(); // นำทางกลับหน้า home
      } catch (err) {

      } finally {
        setisLoading(false);
      }
    } else {
      alert("รหัสพนักงานไม่ตรงกับผู้ใช้ที่เข้าสู่ระบบ");
    }

    clearinputref();
  };

  const handleNextPageStatuscloseprod = async () => {
    const value = inputRef.current?.value.trim();
    if (!value) {
      alert("กรุณากรอกหรือสแกนรหัสก่อนเข้าสู่หน้าถัดไป");
      return;
    }

    if (EmployeeNo === employeeUserName) {
      try {
        setisLoading(true);

        await submitLogCloseprodToReflow120_9();
        await updateReflowStatusClosepro();

        setisCardOpenclosepro(false);
        localStorage.removeItem("productOrderNo");
        window.dispatchEvent(new Event("productOrderNo:removed"));//แจ้ง component อื่นเพราะไม่ยิง STORAGE EVENT ใน layout

        goToHome();
      } catch (err) {
        alert("Error during closeprod process:");
      } finally {
        setisLoading(false);
      }
    } else {
      alert("รหัสพนักงานไม่ตรงกับผู้ใช้ที่เข้าสู่ระบบ");

    }

    clearinputref();
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
        setSubmitStage("CHECKED");
        submitLogToReflow120_9_CHECK();
        updateReflowStatusCHECKED();
        setShowBar(false);
        setisCardOpenONCHECKING(false);
        setIsCardOpen(false);
        setJsonToLocalStorage('modellocal', (data120_2?.productName));
        setJsonToLocalStorage('employeelocal', (EmployeeNo));


      }
      else if (submitStage === "WAITING") {
        setSubmitStage("CHECKED");
        submitLogToReflow120_9_continuous();//change to continue status
        updateReflowStatusCHECKED();
        setShowBar(false);
        setIsCardOpen(false);

      }
      else {
        clearinputref();
        // window.location.reload();
      }
    }
    else {
      alert("รหัสพนักงานไม่ตรงกับผู้ใช้ที่เข้าสู่ระบบ");

    }
  };

  const handleNextPageStatusONCHECKING = () => {
    const value = inputRef.current?.value.trim();
    if (!value) {
      alert("กรุณากรอกหรือสแกนรหัสก่อนเข้าสู่หน้าถัดไป");
      return;
    }

    if (EmployeeNo === employeeUserName) {

      if (submitStage === "WAITING") {
        setSubmitStage("ONCHECKING");
        submitLogToReflow120_9_ONCHECKING();
        updateReflowStatusONCHECKING();
        setJsonToLocalStorage('modellocal', (data120_2?.productName));
        setJsonToLocalStorage('employeelocal', (EmployeeNo));

        setIsCardOpen(false);


      }
      else {
        clearinputref();
        window.location.reload();
      }

    }
    else {
      alert("รหัสพนักงานไม่ตรงกับผู้ใช้ที่เข้าสู่ระบบ");

    }
  };

  let buttonClass = "";
  let buttonClassL = "";
  let buttonContent = null;
  let buttonClick = () => { };
  let w = "w-[50%]";



  useEffect(() => {

    if (submitStage === "CHECKED") {
      // setTopper(false); // ซ่อน topper เมื่อ submitStage เป็น CHECKED
      const timer = setTimeout(() => {
        setTopper(true); // แสดง topper หลังจาก 3 วินาที
      }, 2000);

      return () => clearTimeout(timer); // ทำการล้าง timer เมื่อ component ถูก unmount หรือ submitStage เปลี่ยน
    }
  }, [submitStage]);

  useEffect(() => {
    if (submitStage === "CHECKED") {
      setShowChecked(true); // reset visibility
      const timer = setTimeout(() => {
        setShowChecked(false); // hide after 3 seconds
      }, 2000);
      return () => clearTimeout(timer); // cleanup on unmount or status change
    }
  }, [submitStage]);

  switch (submitStage) {
    case "WAITING":
      w = "";
      buttonClass = "bg-yellow-400 text-black";
      buttonClassL = "bg-yellow-400/50";
      buttonClick = () => setIsCardOpen(true);
      buttonContent = (
        <>
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
        </>
      );
      break;
    case "ONCHECKING":
      w = "";
      buttonClass = "bg-[#9ec5fe] text-black";
      buttonClassL = "bg-[#cfe2ff]";
      buttonClick = () => setisCardOpenONCHECKING(true);
      buttonContent = (
        <>
          <div className="flex flex-col justify-center items-center w-86">
            <div className="flex flex-col justify-center items-center">
              <div className="font-roboto font-bold text-[25px] mb-6">Measurement Profile</div>
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
            <div className="w-full text-[20px] text-white backdrop-blur-md rounded-xl"></div>
          </div>
        </>
      );
      break;
    case "CHECKED":
      buttonClass = "";
      w = "w-[100%]";
      buttonClassL = "bg-green-300/10";
      buttonContent = (
        <>
          <div className="flex flex-col justify-center items-center w-86 ps-4 pe-4">
            <div className="flex items-center">
              <svg className="w-42 h-42" viewBox="0 0 56 56">
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
            </div>
          </div>
        </>
      );
      break;
  }

  useEffect(() => {
    const handleClickOutsideshowAlert = (event: MouseEvent) => {
      if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
        setshowAlert(false);
      }
    };
    if (showAlert) {
      document.addEventListener("mousedown", handleClickOutsideshowAlert);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideshowAlert);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideshowAlert);
    };
  }, [showAlert]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        clearCamera();
        clearinputref();
        setIsCardOpen(false);


      }
    };

    if (isCardOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCardOpen]);



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

  useEffect(() => {
    const handleClickOutsidecardcancel = (event: MouseEvent) => {
      if (cardRefcancel.current && !cardRefcancel.current.contains(event.target as Node)) {
        clearinputref();
        clearCamera();
        setisCardOpencancel(false);

        setArrowDownButton(true);
      }
    };
    if (isCardOpencancel) {
      document.addEventListener("mousedown", handleClickOutsidecardcancel);
    } else {
      document.removeEventListener("mousedown", handleClickOutsidecardcancel);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsidecardcancel);
    };
  }, [isCardOpencancel]);

  useEffect(() => {
    const handleClickOutsideCloseprocard = (event: MouseEvent) => {
      if (cardRefClosepro.current && !cardRefClosepro.current.contains(event.target as Node)) {
        clearCamera();
        clearinputref();
        setisCardOpenclosepro(false);


        setArrowDownButton(true);
      }
    };
    if (isCardOpenclosepro) {
      document.addEventListener("mousedown", handleClickOutsideCloseprocard);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideCloseprocard);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideCloseprocard);
    };
  }, [isCardOpenclosepro]);

  useEffect(() => {
    const handleClickOutsideONCHECKING = (event: MouseEvent) => {
      if (cardRefONCHECKING.current && !cardRefONCHECKING.current.contains(event.target as Node)) {
        clearCamera();
        clearinputref();
        setisCardOpenONCHECKING(false);

      }
    };
    if (isCardOpenONCHECKING) {
      document.addEventListener("mousedown", handleClickOutsideONCHECKING);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideONCHECKING);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideONCHECKING);
    };
  }, [isCardOpenONCHECKING]);



  const handleChangeInputID = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 4) {
      setEmployeeNo(e.target.value);
    }
  };


  const renderLoading = () => (
    <div className="fixed inset-0 flex flex-col w-screen h-screen justify-center items-center z-50 bg-black/20 backdrop-blur-sm">
      <div
        className="flex  justify-center-safe "
      >
        <AiOutlineLoading3Quarters className="size-[200px] animate-spin" />
      </div>
    </div>
  );
  const pointing = () => (
    <div className="fixed top-49 xl:top-100 right-40 z-50"><FaHandPointDown className="size-[60px] text-sky-500 animate-bounce" /> </div>
  );
  const [isLoading, setisLoading] = useState(false);

  return (

    <div className="flex flex-col h-screen w-full bg-blue-100">
      <Suspense fallback={<div>Loading...</div>}>
        <StatusReader onGetproductOrderNo={setProductOrderNo} />
        {(submitStage === 'WAITING' || submitStage === 'ONCHECKING') && pointing()}

        {(isLoading || isLoading120_9) && renderLoading()}
        {isCardOpencancel && (
          <EmployeeIdCard
            cardRef={cardRefcancel}
            inputRef={inputRef}
            employeeName={employeeName}
            onChangeID={handleChangeInputID}
            onScan={startScan}
            onSubmit={handleNextPageStatuscancel}
          />
        )}

        {isCardOpenclosepro && (
          <EmployeeIdCard
            cardRef={cardRefClosepro}
            inputRef={inputRef}
            employeeName={employeeName}
            onChangeID={handleChangeInputID}
            onScan={startScan}
            onSubmit={handleNextPageStatuscloseprod}
          />
        )}

        <div>
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
            <>
              <div className="fixed mt-20 flex w-full flex-row justify-center items-center z-49">
                <div ref={cardarrowRef} className="content-center-safe m-4 w-110 xl:w-150 h-30 xl:h-60 text-[10px] justify-center items-center  rounded-4xl bg-gray-800/70 backdrop-blur-md  ">
                  <div className="flex flex-none h-5 xl:h-10"></div>
                  <div className="flex flex-row justify-center items-center ">
                    <div className="flex w-full h-full justify-center">
                      <div className="flex flex-none"></div>
                      <div
                        onClick={() => {
                          setArrowDownButtoncard(false);
                          setisCardOpencancel(true);
                        }}
                        className="flex flex-col justify-center items-center font-kanit text-white">
                        <div className="flex flex-none"></div>
                        <GoSkipFill className="size-15 xl:size-30 text-white " />
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
                              setArrowDownButtoncard(false);
                              setisCardOpenclosepro(true);
                            }}
                            className="flex flex-col  justify-center items-center font-kanit text-white">
                            <div className="flex flex-none"></div>
                            <GoCheckCircle className="size-15 xl:size-30 text-white" />
                            <div>SUBMIT PRODUCT</div>
                            <div>สำเร็จการวัดโปรไฟล์</div>
                          </div>
                          <div className="flex flex-none "></div>
                        </div>
                        <div className="flex w-full h-full justify-center">
                          <div className="flex flex-none"></div>
                          <div
                            onClick={() => {
                              setArrowDownButtoncard(false);
                              setArrowDownButton(true);
                              handleOpenPdf();
                            }}
                            className="flex flex-col  justify-center items-center font-kanit text-white ">
                            <div className="flex flex-none"></div>
                            <FaFilePdf className=" size-15 xl:size-28 text-white" />
                            <div>RESULT</div>
                            <div>ผลการวัดโปรไฟล์</div>
                          </div>
                          <div className="flex flex-none "></div>
                        </div>
                      </>
                    )}


                  </div>
                  <div className="flex-none h-10"></div>
                </div>
              </div></>
          )}
        </div>

        {topper && (
          <div className="flex flex-col justify-center items-center relative z-40 h-[5%]">
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
                  className={`flex size-15 items-center px-4 py-2 transition-all duration-300 ${buttonClass}`}
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

        {isLoading120_9 ? (
          <div className="flex justify-center items-center text-2xl text-blue-600">
            Loading...

          </div>
        ) : !data120_9 ? (
          <div className="flex justify-center items-center text-2xl text-red-600">
            ❌ ไม่มีข้อมูลจาก 120-9
          </div>
        ) : !showChecked ? (
          <div className="flex justify-center items-center text-2xl text-yellow-600">
          </div>
        ) : (
          // แสดงผลหลัก
          <div
            className={`fixed z-40 top-60 xl:top-110 flex h-70 w-full backdrop-blur-sm drop-shadow-2xl items-center justify-center ${buttonClassL}`}
          >
            {showBar ? (
              <div className="flex flex-col max-h-full w-full ps-4 pe-4 justify-center items-center">
                {/* row1 */}
                <div className="flex w-full justify-start items-center">
                  <div className="flex text-xl justify-start items-center">
                    <div className="flex text-white drop-shadow-2xl font-bold text-[25px]">
                      {data120_9?.R_Line || "ไม่มีข้อมูล R_Line"}
                    </div>
                  </div>
                </div>

                {/* row2 */}
                <div className="flex w-full mt-10 text-xl text-center justify-center items-center">
                  <div className="font-roboto text-white drop-shadow-2xl font-bold text-[40px]">
                    {data120_9?.R_Model || "ไม่มีข้อมูล R_Model"}
                  </div>
                </div>

                {/* row3 */}
                <div className="flex flex-col w-full mt-6 text-xl text-center justify-end items-end">
                  <div className="font-roboto text-white drop-shadow-2xl font-bold text-[25px]">
                    Production No:
                  </div>
                  <div className="text-white drop-shadow-2xl font-roboto font-bold text-[25px]">
                    <Suspense fallback={<div>Loading...</div>}>
                      {data120_2?.productOrderNo || "ไม่มีข้อมูล ProductOrderNo"}
                    </Suspense>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white"> </div>
            )}

            {/* box2 */}
            <div className="flex h-full w-80 items-center justify-center">
              <button
                onClick={buttonClick}
                type="button"
                className={`flex w-full h-full justify-center items-center ps-8 pe-8 shadow transition-all duration-300 ${buttonClass}`}
              >
                {buttonContent}
              </button>
            </div>
          </div>
        )}





        {/* CARD */}
        {
          isCardOpen && (
            <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-45 bg-black/20 backdrop-blur-sm">
              <div ref={cardRef} className="text-[14px] xl:text-xl transition-all duration-300 scale-100 opacity-100 flex flex-col size-110 gap-4 xl:size-160 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl p-6">
                <div className="flex justify-center items-center w-full text-white">Please enter your Employee ID :</div>
                <div className="flex justify-center items-center w-full text-white">โปรดใส่รหัสพนักงานของคุณ : </div>
                <div className="flex justify-center items-center w-full text-white">PLEASE CHECK YOUR ID ('ตรวจสอบข้อมูลของคุณ') = {employeeName || "ไม่มีข้อมูล"} </div>
                <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
                <input
                  ref={inputRef}
                  type="password"
                  autoComplete="off"
                  value={EmployeeNo}
                  onChange={ handleChangeInputID }
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
                      getJsonFromLocalStorage('modellocal');
                      const modellocal = getJsonFromLocalStorage<string>('modellocal');

                      getJsonFromLocalStorage('employeelocal');
                      const employeelocal = getJsonFromLocalStorage<string>('employeelocal');

                      setEmployeeNo(employeelocal ? employeelocal.toString() : "");

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
                  <div onClick={startScan} className="flex flex-col text-white justify-center items-center font-kanit w-1/2">
                    <BsUpcScan className="size-15 xl:size-32 text-white"></BsUpcScan>
                    <div>SCAN</div>
                    <div>สแกน</div>
                  </div>
                  <div
                    onClick={() => {

                      if (passmodelbutton === true) {


                        if (confirmmodel === true && DataInArrayEmployee.includes(confirmemployee?.toString() || "")) {
                          handleNextPageStatusCHECKED();
                        }
                        else {
                          alert('Model is not match or user not allow')
                        }
                      }
                      else if (passmodelbutton === false && DataInArrayEmployee.includes(EmployeeNo)) {
                        handleNextPageStatusONCHECKING();
                        alert('Please Check your ID and try again \n กรุณาเช็ค ID และลองใหม่อีกครั้ง err: Array')
                      }
                      else {
                        alert('Please Check your ID and try again \n กรุณาเช็ค ID และลองใหม่อีกครั้ง')
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
          )
        }
        {
          isCardOpenONCHECKING && (
            <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-45 bg-black/20 backdrop-blur-sm">
              <div ref={cardRefONCHECKING} className="text-[14px] xl:text-xl transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl p-6">
                <div className="flex justify-center items-center w-full text-white">Please enter your Employee ID :</div>
                <div className="flex justify-center items-center w-full text-white">โปรดใส่รหัสพนักงานของคุณ : </div>
                <div className="flex justify-center items-center w-full text-white">PLEASE CHECK YOUR ID ('ตรวจสอบข้อมูลของคุณ') = {employeeName || "ไม่มีข้อมูล"} </div>
                <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
                <input
                  ref={inputRef}
                  type="text"
                  autoComplete="off"
                  onChange={ handleChangeInputID }
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="รหัสพนักงาน"
                />
                <div className="flex w-full h-full items-center">

                  <div className="flex flex-col text-white justify-center items-center font-kanit w-1/2">
                    <div onClick={startScan} className="flex flex-col text-white justify-center items-center font-kanit w-1/2">
                      <BsUpcScan className="size-15 xl:size-32 text-white"></BsUpcScan>
                      <div>SCAN</div>
                      <div>สแกน</div>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      if (DataInArrayEmployee.includes(EmployeeNo)) {
                        handleNextPageStatusCHECKED();
                      }
                      else {
                        alert('Please Check your ID and try again \n กรุณาเช็ค ID และลองใหม่อีกครั้ง')
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
          )
        }
        {isLoading120_9 && <p>🔄 กำลังโหลด PDF...</p>}
        {pdfWarning && <p className="text-red-500 z-10">{pdfWarning}</p>}
        <div className="flex flex-row justify-center items-center w-full h-full">
          {pdfUrl && (
            <Worker workerUrl="./pdf.worker.min.js">
              <div className={`flex items-center justify-center h-screen w-screen bg-gray-100 ${w}`}>
                <div className="w-full h-full">
                  <Viewer
                    fileUrl={pdfUrl}
                    defaultScale={SpecialZoomLevel.PageFit}
                    plugins={[zoomPluginInstance]}
                  />
                </div>
              </div>
            </Worker>
          )}

          {isPdfOpen && (
            <div className={`flex items-center justify-center h-screen w-screen bg-gray-100 ${w}`}>
              <div className="w-full h-full">
                <Worker workerUrl="./pdf.worker.min.js">
                  {pdfUrl2 ? (
                    <Viewer
                      fileUrl={pdfUrl2}
                      defaultScale={SpecialZoomLevel.PageFit}
                      plugins={[zoomPluginInstance]}
                    />
                  ) : (
                    <div className="text-center text-gray-500 text-xl">รอผลการวัด...</div>
                  )}
                </Worker>
              </div>
            </div>
          )}
        </div>



        {/* 🔴 User Popup แสดงเมื่อไม่พบรหัสพนักงาน */}
        {showAlert && (
          <div
            className="modal-overlay">
            <div ref={alertRef} className="modal-content-rg flashing-border text-4xl flex flex-col justify-center items-center">
              <div className="warning-icon">⚠️</div>
              <h2 style={{ color: "red" }}>ALERT</h2>
              <h2 style={{ color: "red" }}>แจ้งเตือน</h2>
              <p>{alertData}</p>
              <button className="close-button" onClick={() => setshowAlert(false)}>X</button>
            </div>
          </div>
        )}
      </Suspense>
    </div >

  );
};

export default checkreflowpage;

