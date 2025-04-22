"use client";
import React, { useState, useRef, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useSearchParams } from 'next/navigation';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { GoSkipFill, GoCheckCircle } from "react-icons/go";
import { BsUpcScan, BsClipboard2DataFill } from "react-icons/bs";

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


//api if !datalocal check status = ??? else back to layout
const checkreflowpage = ({ base64 }: { base64: string }) => {
  const [pdfWarning, setPdfWarning] = useState("");
  const [isLoading120_9, setIsLoading120_9] = useState(true);
  const searchParams = useSearchParams();
  const ProductOrderNo = searchParams.get('productOrderNo');
  const [isCardOpen, setIsCardOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(true);
  const [submitStage, setSubmitStage] = useState<"waiting" | "CHECKED">("waiting");
  const [showChecked, setShowChecked] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [EmployeeNo, setEmployeeNo] = useState("");
  const scannerRef = useRef<any>(null);
  const [topper, setTopper] = useState(false);
  const zoomPluginInstance = zoomPlugin();
  const [data120_2, setData120_2] = useState<DataItem120_2 | null>(null);
  const [isLoading120_2, setIsLoading120_2] = useState(true);
  const [data120_9, setData120_9] = useState<DataItem120_9 | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [statusData120_9, setStatusData120_9] = useState<DataItem120_9_Status | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeUserName, setEmployeeUserName] = useState("");

  useEffect(() => {
    const fetchEmployeeName = async () => {
      const res = await fetch(`https://localhost:3000/api/120-2/select-Employee-id?UserName=${EmployeeNo}`);
      const { success, data } = await res.json();


      if (success && data?.Name && data?.UserName) {
        setEmployeeName(data.Name);
        setEmployeeUserName(data.UserName);
      }
    };

    if (EmployeeNo) fetchEmployeeName();
  }, [EmployeeNo]);


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
        ST_Status: "waiting"
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
        Log_User: EmployeeNo
      };

      const res = await fetch('/api/120-9/checkreflow/insert-REFLOW_log_CHECKED', {
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
    if (ProductOrderNo) {
      setIsLoading120_2(true); // ⏳ เริ่มโหลด
      fetch(`/api/120-2/scan-to-db-120-2?productOrderNo=${ProductOrderNo}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched Data from 120-2:", data);
          setData120_2(data.data);
        })
        .catch((error) => {
          console.error("Failed to fetch 120-2:", error);
        })
        .finally(() => {
          setIsLoading120_2(false); // ✅ โหลดเสร็จแล้ว
        });
    }
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
        }

      } catch (error) {
        console.error("โหลด PDF ล้มเหลว:", error);
        setPdfWarning("เกิดข้อผิดพลาดระหว่างโหลด PDF");
      } finally {
        setIsLoading120_9(false);
      }
    };

    const fetchReflowStatus = async () => {
      try {
        const res = await fetch(`/api/120-9/checkreflow/select-REFLOW_Status?R_Line=${data120_2.ProcessLine}`);
        const { data, success, message } = await res.json();

        if (!success || !data || data.length === 0) {
          console.warn("โหลดสถานะล้มเหลว:", message);
          return;
        }

        const statusItem: DataItem120_9_Status = data[0];
        setStatusData120_9(statusItem); // <- เก็บค่าเข้า state

        // ตรวจสอบเพื่อเปลี่ยนสถานะ
        const { ST_Status, ST_Prod } = statusItem;

        if ((!ST_Status || ST_Status === "null") && (!ST_Prod || ST_Prod === "null")) {
          setSubmitStage("waiting");
          submitLogToReflow120_9();
          updateReflowStatus();

        } else if ((!ST_Status || ST_Status === "waiting") && (!ST_Prod || ST_Prod === ProductOrderNo)) {
          setSubmitStage("waiting");
          submitLogToReflow120_9();
          updateReflowStatus();

        } else if (ST_Status === "CHECKED" && (!ST_Prod || ST_Prod === ProductOrderNo)) {
          setSubmitStage("CHECKED");

        } else {
          console.warn("สถานะไม่รู้จัก:", ST_Status);
        }

      } catch (err) {
        console.error("โหลด REFLOW Status ล้มเหลว:", err);
      }
    };

    fetchPdfData();
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

  useEffect(() => {
    if (isCardOpen && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scannerRef.current.render(
        (decodedText: string) => {
          // เมื่อสแกนเจอ
          if (inputRef.current) {
            inputRef.current.value = decodedText;
          }
          setEmployeeNo(decodedText);



          // เคลียร์ scanner และปิดกล้อง
          scannerRef.current.clear().then(() => {
            scannerRef.current = null;
          }).catch((error: any) => {
            console.error("Failed to clear scanner: ", error);
          });

          // ทำสิ่งอื่น เช่น submit อัตโนมัติ:
          setSubmitStage("CHECKED");
          setShowBar(false);
          setIsCardOpen(false);
        },
        (errorMessage: string) => {
          console.warn("Scan error:", errorMessage);
        }
      );
    }

    return () => {
      // Cleanup ตอน unmount หรือปิด card
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e: any) => console.error(e));
        scannerRef.current = null;
      }
    };
  }, [isCardOpen]);

  let buttonClass = "";
  let buttonClassL = "";
  let buttonContent = null;

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
    case "waiting":

      buttonClass = "bg-yellow-400 text-black";
      buttonClassL = "bg-yellow-400/50";
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
            <div className="w-full text-[20px] text-black backdrop-blur-md rounded-xl"></div>
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
  return (

    <div className="flex flex-col h-screen w-full bg-blue-100">
      <div></div>
      <div className="fixed mt-20 flex w-full flex-row justify-center items-center z-60">
      <div className="content-center-safe m-4 w-150 justify-center items-center h-60 rounded-4xl bg-gray-800/70 backdrop-blur-md  ">
        <div className="flex flex-none h-10"></div>
        <div className="flex flex-row justify-center items-center ">
          <div className="flex w-full h-full justify-center">
            <div className="flex flex-none"></div>
            <div className="flex flex-col justify-center items-center">
              <div className="flex flex-none"></div>
              <GoSkipFill className="size-30 text-white" />
              <div>CANCEL PRODUCT</div>
            </div>
            <div className="flex flex-none"></div>
          </div>
          <div className="flex w-full h-full justify-center">
            <div className="flex flex-none"></div>
            <div className="flex flex-col  justify-center items-center">
              <div className="flex flex-none"></div>
              <GoCheckCircle className="size-30 text-white" />
              <div>SUBMIT PRODUCT</div>
            </div>
            <div className="flex flex-none "></div>
          </div>
        </div>
        <div className="flex-none h-10"></div>
      </div>
      </div>
      {topper && (
        <div className="flex flex-col justify-center items-center relative z-40">
          {/* Header Box */}
          <div className="flex h-22 w-full bg-gradient-to-r from-blue-800 to-blue-700 backdrop-blur-lg drop-shadow-2xl items-center justify-center">
            {/* Box1 */}
            <div className="flex flex-col max-h-full justify-center items-center">
              {/* Row2 */}
              <div className="flex w-full text-xl text-center justify-center items-center pe-4 ps-4">
                <div className="font-roboto text-4xl text-white w-full font-bold">${ProductOrderNo}</div>
              </div>
            </div>
            {/* Box2 */}
            <div className="flex h-full items-center justify-center">
              <button
                onClick={() => setIsCardOpen(true)}
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
          <div className="fixed flex top-0 justify-center w-full h-full text-5xl text-green-400 bg-green-400/20 z-10">
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
          className={`fixed z-40 top-80 flex h-70 w-full backdrop-blur-sm drop-shadow-2xl items-center justify-center ${buttonClassL}`}
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
            <div className="text-white">🔇 showBar ถูกปิด</div>
          )}

          {/* box2 */}
          <div className="flex h-full w-80 items-center justify-center">
            <button
              onClick={() => { setIsCardOpen(true); }}
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
            <div ref={cardRef} className="transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6">
              <div className="flex justify-center items-center w-full text-white">Please enter your Employee ID :</div>
              <div className="flex justify-center items-center w-full text-white">โปรดใส่รหัสพนักงานของคุณ : </div>
              <div id="qr-reader" className="w-full h-60 rounded-lg bg-white my-4" />
              <input
                ref={inputRef}
                type="text"
                value={EmployeeNo}
                onChange={(e) => setEmployeeNo(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="รหัสพนักงาน"
              />
              <div className="flex w-full h-full items-center">

                <span className="flex w-1/2 h-32 justify-center">
                  <BsUpcScan className="size-32 text-white"></BsUpcScan>
                </span>
                <div
                  onClick={() => {
                    console.log(employeeName)
                    if (EmployeeNo === employeeUserName) {

                      if (submitStage === "waiting") {
                        setSubmitStage("CHECKED");

                        submitLogToReflow120_9_CHECK();
                        updateReflowStatusCHECKED();
                        setShowBar(false);
                        setIsCardOpen(false);
                        console.log("CHECKED");
                        console.log("Scanned ID:", EmployeeNo);
                      }
                      else {
                        window.location.reload();
                      }

                    }
                    else {
                      console.log("employeeName != EmployeeNo")
                    }
                  }}
                  className="flex flex-col text-4xl font-bold justify-center items-center font-roboto w-1/2 size-32 bg-green-600 rounded-full">
                  SUBMIT
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

