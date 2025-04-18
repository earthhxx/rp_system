"use client";
import React, { useState, useRef, useEffect } from "react";
import { BsUpcScan } from "react-icons/bs";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useSearchParams } from 'next/navigation';
import { Worker, Viewer } from '@react-pdf-viewer/core';

//api if !datalocal check status = ??? else back to layout
const checkreflowpage = () => {

  const [isLoading120_9, setIsLoading120_9] = useState(true);
  const searchParams = useSearchParams();
  const ProductOrderNo = searchParams.get('productOrderNo');
  const [isCardOpen, setIsCardOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(true);
  const [submitStage, setSubmitStage] = useState<"waiting" | "CHECKED">("waiting");
  const [showChecked, setShowChecked] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [EmployeeNo, setProductOrderNo] = useState("");
  const scannerRef = useRef<any>(null);
  const [SetTopper, setTopper] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [data120_2, setData120_2] = useState<DataItem120_2 | null>(null);
  const [data120_9, setData120_9] = useState<DataItem120_9 | null>(null);

  const [isLoading120_2, setIsLoading120_2] = useState(true);

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


  // Fetching Data 120-2
  useEffect(() => {
    if (ProductOrderNo) {
      setIsLoading120_2(true); // ⏳ เริ่มโหลด
      fetch(`/api/scan-to-db-120-2?productOrderNo=${ProductOrderNo}`)
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
    console.log("🧪 data120_2 useEffect:", data120_2);

    if (

      data120_2 !== null &&
      typeof data120_2.ProcessLine === "string" &&
      typeof data120_2.productName === "string"
    ) {
      setIsLoading120_9(true);
      fetch(`/api/load-pdf-to-db-120-9?R_Line=${data120_2.ProcessLine}&R_Model=${data120_2.productName}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data) {
            const result = data.data; // ไม่ใช่ array
            setData120_9(result); // result เป็น object เดียว

            if (result.R_PDF) {
              try {
                handleShowPdf(result.R_PDF);
              } catch (e) {
                console.error("🚨 Error showing PDF:", e);
              }

            } else {
              console.warn('No PDF in result');
            }
          } else {
            console.warn('No data received from API or no R_Line found');
          }
          setIsLoading120_9(false);
        })
        .catch((error) => console.error("❌ Failed to fetch 120-9:", error));
    }
  }, [data120_2]);




  const handleShowPdf = (base64: string) => {
    if (!base64) {
      console.error("Base64 PDF data is missing");
      return;
    }
  
    try {
      const blob = b64toBlob(base64, "application/pdf");
      console.log("📦 Blob size:", blob.size);
  
      const url = URL.createObjectURL(blob);
      console.log("🔗 Blob URL:", url);
  
      setPdfUrl(url); // ✅ move this into the try block
      console.log("📄 generated blob URL:", url);
    } catch (err) {
      console.error("❌ Failed to show PDF", err);
    }
  };
  

  function b64toBlob(base64: string, mime: string): Blob {
    try {
      const byteChars = atob(base64);
      const byteArrays: Uint8Array[] = [];

      for (let i = 0; i < byteChars.length; i += 512) {
        const slice = byteChars.slice(i, i + 512);
        const byteNumbers = new Array(slice.length);

        for (let j = 0; j < slice.length; j++) {
          byteNumbers[j] = slice.charCodeAt(j);
        }

        byteArrays.push(new Uint8Array(byteNumbers));
      }

      return new Blob(byteArrays, { type: mime });
    } catch (error) {
      console.error("Error converting base64 to Blob:", error);
      return new Blob([], { type: mime }); // Return empty blob on error
    }
  }






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
          setProductOrderNo(decodedText);

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
  if (isLoading120_2 || isLoading120_9) {
    return (

      <div className="flex flex-col h-screen w-full bg-blue-100">\
        ⏳ Loading Data...
        {SetTopper && (
          <div className="flex flex-col justify-center items-center relative">
            {/* Header Box */}
            <div className="flex h-22 w-full bg-gradient-to-r from-blue-800 to-blue-700 backdrop-blur-lg drop-shadow-2xl items-center justify-center">
              {/* Box1 */}
              <div className="flex flex-col max-h-full justify-center items-center">
                {/* Row2 */}
                <div className="flex w-full text-xl text-center justify-center items-center pe-4 ps-4">
                  <div className="font-roboto text-4xl text-white w-full font-bold">CYN-1231213123-DAS-DK</div>
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
            <div className="fixed flex top-0 justify-center w-full h-full text-5xl text-green-400 bg-green-400/20">
              <div className="flex justify-center items-center"> ! SUCCESS ! {ProductOrderNo} </div>
            </div>
          </div>
        )}

        {isLoading120_2 ? (
          // กำลังโหลดข้อมูล
          <div className="flex justify-center items-center text-2xl text-blue-600">
            Loading...
          </div>
        ) : data120_2 && showChecked ? (
          // โหลดเสร็จแล้ว + ต้องการแสดงผล
          <div className={`fixed top-80 flex h-70 w-full backdrop-blur-sm drop-shadow-2xl items-center justify-center ${buttonClassL}`}>
            {showBar && (
              <div className="flex flex-col max-h-full w-full ps-4 pe-4 justify-center items-center">
                {/* row1 */}
                <div className="flex w-full justify-start items-center">
                  <div className="flex text-xl justify-start items-center">
                    <div className="flex text-white drop-shadow-2xl font-bold text-[25px]">
                      {data120_9?.R_Line}
                    </div>
                  </div>
                </div>
                {/* row2 */}
                <div className="flex w-full mt-10 text-xl text-center justify-center items-center">
                  <div className="font-roboto text-white drop-shadow-2xl font-bold text-[40px]">
                    {data120_9?.R_Model}
                  </div>
                </div>
                {/* row3 */}
                <div className="flex flex-col w-full mt-6 text-xl text-center justify-end items-end">
                  <div className="font-roboto text-white drop-shadow-2xl font-bold text-[25px]">
                    Production No:
                  </div>
                  <div className="text-white drop-shadow-2xl font-roboto font-bold text-[25px]">
                    {ProductOrderNo}
                  </div>
                </div>
              </div>
            )}

            {/* box2 */}
            <div className="flex h-full w-80 items-center justify-center">
              <button
                onClick={() => setIsCardOpen(true)}
                type="button"
                className={`flex w-full h-full justify-center items-center ps-8 pe-8 shadow transition-all duration-300 ${buttonClass}`}
              >
                {buttonContent}
              </button>
            </div>
          </div>
        ) : null}

        {/* CARD */}
        {
          isCardOpen && (
            <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-30 bg-black/20 backdrop-blur-sm">
              <div ref={cardRef} className="transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6">
                <div className="flex justify-center items-center w-full text-white">Please enter your Employee ID :</div>
                <div className="flex justify-center items-center w-full text-white">โปรดใส่รหัสพนักงานของคุณ : </div>
                <div id="qr-reader" className="w-full h-60 rounded-lg bg-white my-4" />
                <input
                  ref={inputRef}
                  type="text"
                  value={EmployeeNo}
                  id="employee_id"
                  onChange={(e) => setProductOrderNo(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="รหัสพนักงาน"
                />
                <div className="flex w-full h-full items-center">

                  <span className="flex w-1/2 h-32 justify-center">
                    <BsUpcScan className="size-32 text-white"></BsUpcScan>
                  </span>
                  <div
                    onClick={() => {
                      if (submitStage === "waiting") {
                        setSubmitStage("CHECKED");
                        setShowBar(false);
                        setIsCardOpen(false);
                        console.log("CHECKED");
                        console.log("Scanned ID:", EmployeeNo);
                      }
                      else {
                        window.location.reload();
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
        {pdfUrl ? (
          <>
            <div className='show-close'>
              <h2>แสดง PDF</h2>
              <button className='close-pdf' onClick={() => setPdfUrl(null)}>X</button>
            </div>
            <div style={{ height: '600px' }}>
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer fileUrl={pdfUrl} />
              </Worker>
            </div>
          </>
        ) : (
          <div className="text-gray-500">No PDF loaded</div>
        )}


        <a href={pdfUrl || '#'} download="test.pdf" className="text-blue-500 underline mt-4 block">
          🔽 Download PDF
        </a>
      </div>
    );
  }
};

export default checkreflowpage;
