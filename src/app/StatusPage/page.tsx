"use client";
import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { useSearchParams } from 'next/navigation';
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

type DataItem120_2 = {
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
};

type DataItem120_9_Result = {
  R_PDF2: string;
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
const checkreflowpage = ({ base64 }: { base64: string }) => {
  const [pdfUrl2, setPdfUrl2] = useState<string | null>(null);
  const router = useRouter();
  const goToHome = () => {
    router.push('/');
  };

  const togglepassmodelbutton = () => {
    setpassmodelbutton(prev => !prev); // สลับสถานะ
  };

  const [confirmmodel, setconfirmmodel] = useState(false);
  const [passmodelbutton, setpassmodelbutton] = useState(false);

  const [pdfWarning, setPdfWarning] = useState("");
  const [pdfWarning2, setPdfWarning2] = useState("");
  const [isLoading120_9, setIsLoading120_9] = useState(true);
  const searchParams = useSearchParams();
  const ProductOrderNo = searchParams.get('productOrderNo');

  const [isCardOpen, setIsCardOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [showBar, setShowBar] = useState(true);
  const [submitStage, setSubmitStage] = useState<"WAITING" | "ONCHECKING" | "CHECKED">("WAITING");
  const [showChecked, setShowChecked] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [EmployeeNo, setEmployeeNo] = useState("");
  const [isPdfOpen, setPdfOpen] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);


  const [topper, setTopper] = useState(false);

  const [arrowdownbuttoncard, setArrowDownButtoncard] = useState(false);
  const [arrowdownbutton, setArrowDownButton] = useState(true);
  const cardarrowRef = useRef<HTMLDivElement>(null);



  const [isCardOpencancel, setisCardOpencancel] = useState(false);
  const cardRefcancel = useRef<HTMLInputElement>(null);

  const [isCardOpenclosepro, setisCardOpenclosepro] = useState(false);
  const cardRefClosepro = useRef<HTMLInputElement>(null);

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
      console.log("✅ Data URI set for PDF", dataUri);
    } catch (err) {
      console.error("❌ Failed to convert base64 to data URI:", err);
      setPdfWarning2("เกิดข้อผิดพลาดขณะแปลง PDF");
    }
  };
  const handleOpenPdf = async () => {
    setPdfOpen(true);
    await fetchPdfData2();
  };

  //LOAD Moldel from local
  useEffect(() => {
    if (data120_2) {
      const getmodel: string | null = getJsonFromLocalStorage('modellocal');

      if (getmodel === data120_2.productName) {
        setconfirmmodel(true);
      } else {
        console.log('Model is not match');
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
      if (!data120_2?.ProcessLine || !data120_2?.productName || !ProductOrderNo) {
        console.warn("⛔ พารามิเตอร์ไม่ครบ ไม่โหลด PDF");
        setPdfWarning2("ข้อมูลไม่พร้อม โหลด PDF ไม่ได้");
        return;
      }

      const res = await fetch(
        `/api/120-9/checkreflow/load-pdf-data2?R_Line=${data120_2.ProcessLine}&R_Model=${data120_2.productName}&productOrderNo=${ProductOrderNo}`
      );
      const { data } = await res.json();
      console.log("✅ ได้ข้อมูล PDF:", data);

      if (data?.R_PDF2) {
        const decoded = atob(data.R_PDF2);
        if (decoded.startsWith('%PDF-') || decoded.startsWith('JVBER')) {
          handleShowPdf2(data.R_PDF2);
        } else {
          console.warn("⚠️ PDF format ผิดพลาด");
          setPdfWarning2('PDF format ผิดพลาด');
        }
      } else {
        console.warn("⚠️ ไม่พบข้อมูล R_PDF2");
        setPdfWarning2('ไม่พบข้อมูล PDF');
      }
    } catch (err) {
      console.error("❌ โหลด PDF ล้มเหลว:", err);
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

    const result = await res.json();
    console.log(result);
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
        ST_Status: "CHECKED"
      })
    });

    const result = await res.json();
    console.log(result);
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
        ST_Status: "ONCHECKING"
      })
    });

    const result = await res.json();
    console.log(result);
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
    console.log(result);
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

    const result = await res.json();
    console.log(result);
  };
  //ONCHECKING
  //submit log state to check
  const submitLogToReflow120_9_ONCHECKING = async () => {
    if (!data120_2 || !submitStage) {
      console.warn("Missing required fields to submit log");
      return;
    }

    try {
      const payload = {
        R_Line: data120_2.ProcessLine,
        R_Model: data120_2.productName,
        productOrderNo: ProductOrderNo,
        ST_Status: "ONCHECKING",
        Log_User: EmployeeNo,
        Log_UserID:employeeName ,
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
        console.error("Log submit failed:", result.message);
      } else {
        console.log("Log submitted successfully");
      }

    } catch (error) {
      console.error("Error submitting log:", error);
    }
  };

  //submit log state to waiting
  const submitLogToReflow120_9 = async () => {
    if (!data120_2 || !submitStage) {
      console.warn("Missing required fields to submit log");
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
        console.error("Log submit failed:", result.message);
      } else {
        console.log("Log submitted successfully");
      }

    } catch (error) {
      console.error("Error submitting log:", error);
    }
  };


  //submit log state to check
  const submitLogToReflow120_9_CHECK = async () => {
    if (!data120_2 || !submitStage) {
      console.warn("Missing required fields to submit log");
      return;
    }

    try {
      const payload = {
        R_Line: data120_2.ProcessLine,
        R_Model: data120_2.productName,
        productOrderNo: ProductOrderNo,
        ST_Status: "CHECKED",
        Log_User: EmployeeNo,
        Log_UserID:employeeName ,
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
        console.error("Log submit failed:", result.message);
      } else {
        console.log("Log submitted successfully");
      }

    } catch (error) {
      console.error("Error submitting log:", error);
    }
  };

    //submit log state to check
    const submitLogToReflow120_9_continuous = async () => {
      if (!data120_2 || !submitStage) {
        console.warn("Missing required fields to submit log");
        return;
      }
  
      try {
        const payload = {
          R_Line: data120_2.ProcessLine,
          R_Model: data120_2.productName,
          productOrderNo: ProductOrderNo,
          ST_Status: "CONTINUOUS",
          Log_User: EmployeeNo,
          Log_UserID:employeeName ,
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
          console.error("Log submit failed:", result.message);
        } else {
          console.log("Log submitted successfully");
        }
  
      } catch (error) {
        console.error("Error submitting log:", error);
      }
    };

  // //submit log state to cancel
  const submitLogcancelToReflow120_9 = async () => {
    if (!data120_2 || !submitStage) {
      console.warn("Missing required fields to submit log");
      return;
    }

    try {
      const payload = {
        R_Line: data120_2.ProcessLine,
        R_Model: data120_2.productName,
        productOrderNo: ProductOrderNo,
        ST_Status: 'Cancel',
        Log_User: EmployeeNo,
        Log_UserID:employeeName,
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
        console.error("Log submit failed:", result.message);
      } else {
        console.log("Log submitted successfully");
      }

    } catch (error) {
      console.error("Error submitting log:", error);
    }
  };

  // //submit log state to cancel
  const submitLogCloseprodToReflow120_9 = async () => {
    if (!data120_2 || !submitStage) {
      console.warn("Missing required fields to submit log");
      return;
    }

    try {
      const payload = {
        R_Line: data120_2.ProcessLine,
        R_Model: data120_2.productName,
        productOrderNo: ProductOrderNo,
        ST_Status: 'close',
        Log_User: EmployeeNo,
        Log_UserID:employeeName ,
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
        console.error("Log submit failed:", result.message);
      } else {
        console.log("Log submitted successfully");
      }

    } catch (error) {
      console.error("Error submitting log:", error);
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

      setIsLoading120_2(true); // ⏳ เริ่มโหลด
      try {
        const res = await fetch(`/api/120-2/scan-to-db-120-2?productOrderNo=${ProductOrderNo}`);
        const data = await res.json();
        console.log("Fetched Data from 120-2:", data);
        // ตรวจสอบว่า data ไม่มีข้อมูลหรือมี error ภายใน payload
        if (!data || !data.data || data.success === false || data.error) {
          alert("ข้อมูลไม่ถูกต้องหรือว่างเปล่า");
          localStorage.removeItem("productOrderNo");
          window.dispatchEvent(new Event("productOrderNo:removed"));//แจ้ง component อื่นเพราะไม่ยิง STORAGE EVENT ใน layout
          router.push('/'); // นำทางกลับหน้า home

        }


        setData120_2(data.data);
      } catch (error) {
        console.error("Failed to fetch 120-2:", error);
        alert(`api ผิดพลาด`);
        localStorage.removeItem("productOrderNo");
        window.dispatchEvent(new Event("productOrderNo:removed"));//แจ้ง component อื่นเพราะไม่ยิง STORAGE EVENT ใน layout
        router.push('/'); // นำทางกลับหน้า home
      } finally {
        setIsLoading120_2(false); // ✅ โหลดเสร็จแล้ว
      }
    };

    fetchData();
  }, [ProductOrderNo]);


  useEffect(() => {
    if (!data120_2) return;

    const fetchPdfData = async () => {
      setIsLoading120_9(true);
      setPdfWarning('');
      setPdfUrl(null);

      try {
        const res = await fetch(`/api/120-9/checkreflow/load-pdf-data?R_Line=${data120_2.ProcessLine}&R_Model=${data120_2.productName}`);
        const { data, success, message } = await res.json();

        if (!success || !data) {
          setPdfWarning(message || 'ไม่พบข้อมูลจาก API load-pdf-data');
          return;
        }

        setData120_9(data);

        // ตรวจสอบและแสดง PDF
        if (!data.R_PDF) {
          setPdfWarning("ไม่พบข้อมูล R_PDF ในฐานข้อมูล");
          return;
        }

        try {
          const decoded = atob(data.R_PDF);
          if (decoded.startsWith("%PDF-")) {
            handleShowPdf(data.R_PDF);
          } else {
            setPdfWarning("ไม่พบไฟล์ PDF หรือข้อมูลไม่ถูกต้อง");
          }
        } catch (e) {
          console.error("Base64 decode error:", e);
          setPdfWarning("ข้อมูล PDF ไม่สามารถแปลงได้");
          alert(
            `ไม่พบข้อมูล STANDARD PDF`
          );
        }

      } catch (error) {
        console.error("โหลด PDF ล้มเหลว:", error);
        setPdfWarning("เกิดข้อผิดพลาดระหว่างโหลด PDF");
        alert(
          `ไม่พบข้อมูล STANDARD PDF`
        );
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
          console.warn("โหลดสถานะล้มเหลว:", message);
          return;
        }

        const statusItem: DataItem120_9_Status = data[0];
        setStatusData120_9(statusItem);

        const { ST_Status, ST_Prod } = statusItem;

        const isProdMatch = ST_Prod === ProductOrderNo;

        if ((!ST_Status || ST_Status === "null") && (!ST_Prod || ST_Prod === "null")) {
          setSubmitStage("WAITING");
          submitLogToReflow120_9();
          updateReflowStatus();
          fetchPdfData();

        } else if (ST_Status === "WAITING" && isProdMatch) {
          setSubmitStage("WAITING");
          fetchPdfData();

        } else if (ST_Status === "ONCHECKING" && isProdMatch) {
          setSubmitStage("ONCHECKING");
          fetchPdfData();

        } else if (ST_Status === "CHECKED" && isProdMatch) {
          setSubmitStage("CHECKED");
          fetchPdfData();

        } else {
          console.warn("สถานะไม่รู้จัก:", ST_Status);
          alert(`สถานะไม่รู้จัก: ${ST_Status}`);
        }

      } catch (err) {
        console.error("โหลด REFLOW Status ล้มเหลว:", err);
        alert(`โหลด REFLOW Status ล้มเหลว: ${err}`);
      }
    };

    fetchReflowStatus();
  }, [data120_2]);


  // 👉 ฟังก์ชันแปลง base64 → blob → objectURL
  const handleShowPdf = (base64: string) => {
    try {
      const dataUri = `data:application/pdf;base64,${base64}`;
      setPdfUrl(dataUri);
      console.log("✅ Data URI set for PDF", pdfUrl);
    } catch (err) {
      console.error("❌ Failed to convert base64 to data URI:", err);
      setPdfWarning("เกิดข้อผิดพลาดขณะแปลง PDF");
    }
  };

  useEffect(() => {
    if (pdfUrl) {
      console.log("📎 PDF URL is ready:", pdfUrl);
    }
  }, [pdfUrl]);
  const startScan = async () => {
    const qrRegionId = "qr-reader";
    const html5QrCode = new Html5Qrcode(qrRegionId);
    scannerRef.current = html5QrCode;

    try {
      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {
        console.error("ไม่พบกล้องบนอุปกรณ์");
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
        (err) => console.warn("QR Scan Error:", err)
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
      console.error("Camera initialization error:", err);
    }
  };

  const clearCamera = () => {
    if (scannerRef.current) {
      // ถ้าเป็น Html5Qrcode instance
      if ("stop" in scannerRef.current) {
        scannerRef.current
          .stop()      // หยุดกล้อง
          .then(() => scannerRef.current!.clear()) // ล้าง DOM และ memory
          .catch((e: Error) => console.error("Stop error:", e));
      }
      // ถ้าเป็น Html5QrcodeScanner instance
      else {
        (scannerRef.current as Html5QrcodeScanner)
          .clear()
          .then(() => {
            scannerRef.current = null;
          })
          .catch((e: Error) => console.error("Clear error:", e));
      }
    }
  };

  useEffect(() => {
    console.log('inputRef.current:', inputRef.current);
  }, [isCardOpen, isCardOpencancel, isCardOpenclosepro]);

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
        console.error("Error during cancel process:", err);
      } finally {
        setisLoading(false);
      }
    } else {
      alert("รหัสพนักงานไม่ตรงกับผู้ใช้ที่เข้าสู่ระบบ");
      console.log("employeeName != EmployeeNo");
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
        console.error("Error during closeprod process:", err);
      } finally {
        setisLoading(false);
      }
    } else {
      alert("รหัสพนักงานไม่ตรงกับผู้ใช้ที่เข้าสู่ระบบ");
      console.log("employeeName != EmployeeNo");
    }

    clearinputref();
  };

  const handleNextPageStatusCHECKED = () => {
    const value = inputRef.current?.value.trim();
    if (!value) {
      alert("กรุณากรอกหรือสแกนรหัสก่อนเข้าสู่หน้าถัดไป");
      return;
    }
    console.log(employeeName)
    if (EmployeeNo === employeeUserName) {

      if (submitStage === "ONCHECKING") {
        setSubmitStage("CHECKED");
        submitLogToReflow120_9_CHECK();
        updateReflowStatusCHECKED();
        setShowBar(false);
        setisCardOpenONCHECKING(false);
        setIsCardOpen(false);
        setJsonToLocalStorage('modellocal', (data120_2?.productName));

        console.log("CHECKED");
        console.log("Scanned ID:", EmployeeNo);
      }
      else if (submitStage === "WAITING") {
        setSubmitStage("CHECKED");
        submitLogToReflow120_9_continuous();//change to continue status
        updateReflowStatusCHECKED();
        setShowBar(false);
        setIsCardOpen(false);
        setJsonToLocalStorage('modellocal', (data120_2?.productName));

        console.log("CHECKED PASS FROM WAITING");
        console.log("Scanned ID:", EmployeeNo);
      }
      else {
        clearinputref();
        console.log(submitStage);
        // window.location.reload();
      }
    }
    else {
      alert("รหัสพนักงานไม่ตรงกับผู้ใช้ที่เข้าสู่ระบบ");
      console.log("employeeName != EmployeeNo")
    }
  };




  const handleNextPageStatusONCHECKING = () => {
    const value = inputRef.current?.value.trim();
    if (!value) {
      alert("กรุณากรอกหรือสแกนรหัสก่อนเข้าสู่หน้าถัดไป");
      return;
    }
    console.log(employeeName)
    if (EmployeeNo === employeeUserName) {

      if (submitStage === "WAITING") {
        setSubmitStage("ONCHECKING");
        submitLogToReflow120_9_ONCHECKING();
        updateReflowStatusONCHECKING();

        setIsCardOpen(false);

        console.log("ONCHECKING");
        console.log("Scanned ID:", EmployeeNo);
      }
      else {
        clearinputref();
        window.location.reload();
      }

    }
    else {
      alert("รหัสพนักงานไม่ตรงกับผู้ใช้ที่เข้าสู่ระบบ");
      console.log("employeeName != EmployeeNo")
    }
  };

  let buttonClass = "";
  let buttonClassL = "";
  let buttonContent = null;
  let buttonClick = () => { };



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

  useEffect(() => {
    if (!isCardOpen && !isCardOpencancel && !isCardOpenclosepro && !isCardOpenONCHECKING) {
      inputRef.current = null;
      setEmployeeName("");
    }
  }, [isCardOpen, isCardOpencancel, isCardOpenclosepro, isCardOpenONCHECKING]);

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
    <div className="fixed top-100 right-40 z-50"><FaHandPointDown className="size-[60px] text-sky-500 animate-bounce" /> </div>
  );
  const [isLoading, setisLoading] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full bg-blue-100">
      {(submitStage === 'WAITING' || submitStage === 'ONCHECKING') && pointing()}


      {(isLoading || isLoading120_9) && renderLoading()}
      {
        isCardOpencancel && (
          <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-45 bg-black/20 backdrop-blur-sm">
            <div ref={cardRefcancel} className="transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6">
              <div className="flex justify-center items-center w-full text-white">Please enter your Employee ID :</div>
              <div className="flex justify-center items-center w-full text-white">โปรดใส่รหัสพนักงานของคุณ : </div>
              <div className="flex justify-center items-center w-full text-white">PLEASE CHECK YOUR ID ('ตรวจสอบข้อมูลของคุณ') = {employeeName || "ไม่มีข้อมูล"} </div>
              <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
              <input
                ref={inputRef}
                type="text"
                onChange={(e) => setEmployeeNo(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="รหัสพนักงาน"
              />
              <div className="flex w-full h-full items-center">

                <span
                  onClick={startScan}
                  className="flex w-1/2 h-32 justify-center">
                  <BsUpcScan className="size-32 text-white"></BsUpcScan>
                </span>
                <div
                  onClick={() => {
                    handleNextPageStatuscancel();
                  }}
                  className="flex flex-col text-xl font-bold justify-center items-center font-kanit w-1/2 size-32 bg-green-600 rounded-full">
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
        isCardOpenclosepro && (
          <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-45 bg-black/20 backdrop-blur-sm">
            <div ref={cardRefClosepro} className="transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6">
              <div className="flex justify-center items-center w-full text-white">Please enter your Employee ID :</div>
              <div className="flex justify-center items-center w-full text-white">โปรดใส่รหัสพนักงานของคุณ : </div>
              <div className="flex justify-center items-center w-full text-white">PLEASE CHECK YOUR ID ('ตรวจสอบข้อมูลของคุณ') = {employeeName || "ไม่มีข้อมูล"} </div>
              <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
              <input
                ref={inputRef}
                type="text"
                onChange={(e) => setEmployeeNo(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="รหัสพนักงาน"
              />
              <div className="flex w-full h-full items-center">

                <span
                  onClick={startScan}
                  className="flex w-1/2 h-32 justify-center">
                  <BsUpcScan className="size-32 text-white"></BsUpcScan>
                </span>
                <div
                  onClick={() => {
                    handleNextPageStatuscloseprod();
                  }}
                  className="flex flex-col text-xl font-bold justify-center items-center font-kanit w-1/2 size-32 bg-green-600 rounded-full">
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
              <div ref={cardarrowRef} className="content-center-safe m-4 w-150 justify-center items-center h-60 rounded-4xl bg-gray-800/70 backdrop-blur-md  ">
                <div className="flex flex-none h-10"></div>
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
                      <GoSkipFill className="size-30 text-white " />
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
                          <GoCheckCircle className="size-30 text-white" />
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
                            setPdfOpen(true);
                            handleOpenPdf();
                            console.log('pass setpdfopen')
                          }}
                          className="flex flex-col  justify-center items-center font-kanit text-white ">
                          <div className="flex flex-none"></div>
                          <FaFilePdf className="size-28 text-white" />
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
        <div className="flex flex-col justify-center items-center relative z-40">
          {/* Header Box */}
          <div className="flex h-22 w-full bg-gradient-to-r from-blue-800 to-blue-700 backdrop-blur-lg drop-shadow-2xl items-center justify-center">
            {/* Box1 */}
            <div className="flex flex-col max-h-full justify-center items-center">
              {/* Row2 */}
              <div className="flex w-full text-xl text-center justify-center items-center pe-4 ps-4">
                <div className="font-roboto text-4xl text-white w-full font-bold">{data120_2?.productName}</div>
              </div>
            </div>
            {/* Box2 */}
            <div className="flex h-full items-center justify-center">
              <button
                // onClick={() => setIsCardOpen(true)}
                type="button"
                className={`flex size-20 items-center px-4 py-2 transition-all duration-300 ${buttonClass}`}
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

          {/* Success Message */}
          <div className="fixed flex top-0 justify-center w-full h-full text-5xl text-green-400 bg-green-400/5 z-10">
            {/* <div className="flex justify-center items-center"> ! SUCCESS ! {ProductOrderNo} </div> */}
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
          className={`fixed z-40 top-110 flex h-70 w-full backdrop-blur-sm drop-shadow-2xl items-center justify-center ${buttonClassL}`}
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
                  {ProductOrderNo || "ไม่พบ ProductOrderNo"}
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
      {isPdfOpen && (
        <div className="fixed inset-0 z-50 bg-gray-100 flex items-center justify-center">
          <button
            onClick={() => {
              setPdfOpen(false);
              setArrowDownButton(true);
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white font-bold rounded-full shadow-lg z-49"
          >
            ✕
          </button>

          {pdfUrl2 && (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
                <div className="w-full h-full ">
                  <Viewer
                    fileUrl={pdfUrl2}
                    defaultScale={SpecialZoomLevel.PageFit}
                    plugins={[zoomPluginInstance]}
                  />
                </div>
              </div>
            </Worker>
          )}
        </div>
      )}



      {/* CARD */}
      {
        isCardOpen && (
          <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-45 bg-black/20 backdrop-blur-sm">
            <div ref={cardRef} className="transition-all duration-300 scale-100 opacity-100 flex flex-col h-fit gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl p-6">
              <div className="flex justify-center items-center w-full text-white">Please enter your Employee ID :</div>
              <div className="flex justify-center items-center w-full text-white">โปรดใส่รหัสพนักงานของคุณ : </div>
              <div className="flex justify-center items-center w-full text-white">PLEASE CHECK YOUR ID ('ตรวจสอบข้อมูลของคุณ') = {employeeName || "ไม่มีข้อมูล"} </div>
              <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
              <input
                ref={inputRef}
                type="text"
                onChange={(e) => setEmployeeNo(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="รหัสพนักงาน"
              />
              <button
                onClick={togglepassmodelbutton}
                className={`px-4 py-2 rounded ${passmodelbutton ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
                  }`}
              >
                {passmodelbutton ? 'วัดโปรไฟล์ต่อเนื่อง' : 'วัดโปรไฟล์ใหม่'}
              </button>
              <div className="flex w-full h-full items-center">

                <span
                  onClick={startScan}
                  className="flex w-1/2 h-32 justify-center">
                  <BsUpcScan className="size-32 text-white"></BsUpcScan>
                </span>
                <div
                  onClick={() => {
                    if (passmodelbutton === true) {
                      if (confirmmodel === true) {
                        handleNextPageStatusCHECKED();
                        console.log('true');
                      }
                      else {
                        alert('Model is not match')
                      }
                    }
                    else {
                      handleNextPageStatusONCHECKING();
                    }
                  }}
                  className="flex flex-col text-xl font-bold justify-center items-center font-kanit w-1/2 size-32 bg-green-600 rounded-full">
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
            <div ref={cardRefONCHECKING} className="transition-all duration-300 scale-100 opacity-100 flex flex-col h-fit gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl p-6">
              <div className="flex justify-center items-center w-full text-white">Please enter your Employee ID :</div>
              <div className="flex justify-center items-center w-full text-white">โปรดใส่รหัสพนักงานของคุณ : </div>
              <div className="flex justify-center items-center w-full text-white">PLEASE CHECK YOUR ID ('ตรวจสอบข้อมูลของคุณ') = {employeeName || "ไม่มีข้อมูล"} </div>
              <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
              <input
                ref={inputRef}
                type="text"
                onChange={(e) => setEmployeeNo(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="รหัสพนักงาน"
              />
              <div className="flex w-full h-full items-center">

                <span
                  onClick={startScan}
                  className="flex w-1/2 h-32 justify-center">
                  <BsUpcScan className="size-32 text-white"></BsUpcScan>
                </span>
                <div
                  onClick={() => {
                    handleNextPageStatusCHECKED();

                  }}
                  className="flex flex-col text-xl font-bold justify-center items-center font-kanit w-1/2 size-32 bg-green-600 rounded-full">
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
      {pdfUrl && (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
            <div className="w-full h-full ">
              <Viewer
                fileUrl={pdfUrl}
                defaultScale={SpecialZoomLevel.PageFit}
                plugins={[zoomPluginInstance]}
              />
            </div>
          </div>
        </Worker>
      )}

    </div >

  );
};

export default checkreflowpage;

