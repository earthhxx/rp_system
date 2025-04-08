"use client"
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { BsClipboard2DataFill, BsUpcScan } from "react-icons/bs";
import { GoCheckCircle, GoSkipFill } from "react-icons/go";

const checkreflowpage = () => {
  const [isCardOpen, setIsCardOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(true);
  type SubmitStage = "waiting" | "CHECKED";
  const [submitStage, setSubmitStage] = useState<SubmitStage>("waiting");
  const [showChecked, setShowChecked] = useState(true);

  let buttonClass = "";
  let buttonClassL = "";
  let buttonContent = null;

  useEffect(() => {
    if (submitStage === "CHECKED") {
      setShowChecked(true); // reset visibility
      const timer = setTimeout(() => {
        setShowChecked(false); // hide after 3 seconds
      }, 3000);
      return () => clearTimeout(timer); // cleanup on unmount or status change
    }
  }, [submitStage]);

  switch (submitStage) {
    case "waiting":

      buttonClass = "bg-yellow-400 text-black";
      buttonClassL = "bg-yellow-400/30"
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
            <div className="w-full text-[20px] text-black backdrop-blur-md rounded-xl">
            </div>
          </div>

        </>
      );
      break;
    case "CHECKED":
      buttonClass = "";
      buttonClassL = "bg-green-400/10"
      buttonContent = 
        <>
          <div className="flex flex-col justify-center items-center w-86 ps-4 pe-4">
            <div className="flex items-center">
              <svg
                className="w-42 h-42"
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
            </div>
          </div>
        </>
      break;
  }



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target as Node)
      ) {
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
      {showChecked && (
      <div className={`fixed top-80 flex h-70 w-full backdrop-blur-sm drop-shadow-2xl items-center justify-center ${buttonClassL}`}>
        {showBar && (

          < div className="flex flex-col max-h-full w-full ps-4 pe-4 justify-center items-center">
            {/* row1 */}
            <div className="flex w-full justify-start items-center">
              <div className="flex text-xl justify-start items-center">
                <div className="flex text-white drop-shadow-2xl font-bold text-[25px]">SMT-13</div>
              </div>
            </div>
            {/* row2 */}
            <div className="flex w-full mt-10 text-xl text-center justify-center items-center">
              <div className="font-roboto text-white drop-shadow-2xl font-bold text-[40px]">NPVV051DX1BM8BO</div>
            </div>
            {/* row3 */}
            <div className="flex flex-col w-full mt-6 text-xl text-center justify-end items-end">
              <div className="font-roboto text-white drop-shadow-2xl font-bold text-[25px]">Production No:</div>
              <div className="text-white drop-shadow-2xl font-roboto font-bold text-[25px]">202504030036</div>
            </div>
          </div>



        )}

        {/* box2 */}
        
        <div className="flex h-full w-80 items-center justify-center">
          <button
            onClick={() => setIsCardOpen(true)}
            type="button"
            className={`flex w-full h-full justify-center items-center ps-8 pe-8 shadow transition-all duration-300  ${buttonClass}`}
          >
            {buttonContent}
          </button>
        </div>
      </div>
      )}


      {/* CARD */}
      {
        isCardOpen && (
          <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-30 bg-black/20 backdrop-blur-sm">
            <div ref={cardRef} className="transition-all duration-300 scale-100 opacity-100 grid grid-cols-3 gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6">
              <div className="flex w-full h-full"></div>
              <div
                onClick={() => {
                  if (submitStage === "waiting") {
                    setSubmitStage("CHECKED");
                    setShowBar(false);
                    setIsCardOpen(false);
                    console.log("CHECKED");
                  }
                  else {
                    window.location.reload();
                  }

                }}
                className="flex flex-col justify-center items-center w-full h-full">

                <GoCheckCircle className="size-30" />
                SUBMIT PRODUCT
              </div>
              <div className="flex w-full h-full"></div>
              <div className="flex flex-col justify-center items-center w-full h-full">
                <BsClipboard2DataFill className="size-30" />
                DASHBOARD
              </div>
              <div className="flex w-full h-full"></div>
              <div className="flex flex-col justify-center items-center w-full h-full">
                <BsUpcScan className="size-30" />
                SCAN PRODUCT
              </div>
              <div className="flex w-full h-full"></div>
              <div className="flex flex-col justify-center items-center w-full h-full">
                <GoSkipFill className="size-30" />
                CANCEL PRODUCT
              </div>
              <div className="flex w-full h-full"></div>
            </div>
          </div>
        )
      }

      {/* Image Section */}
      <div className="flex-grow w-full overflow-hidden">
        <Image
          src="/images/Test Reflow Temp_page-0001.jpg"
          alt="Menu Image"
          width={819}
          height={1093}
          className="w-full h-full"
        />
      </div>
    </div >
  );
};

export default checkreflowpage;
