"use client"
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { BsClipboard2DataFill, BsUpcScan } from "react-icons/bs";
import { GoCheckCircle, GoSkipFill } from "react-icons/go";


const Home = () => {
  const [isCardOpen, setIsCardOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  type SubmitStage = "idle" | "waiting" | "CHECKED";
  const [submitStage, setSubmitStage] = useState<SubmitStage>("idle");

  let buttonClass = "";
  let buttonClassL = "";
  let buttonContent = null;

  switch (submitStage) {
    case "idle":
      buttonClass = "bg-blue-50 text-blue-800";
      buttonClassL = "bg-sky-100"
      buttonContent = (
        <>
          <div className="flex w-full h-full justify-center items-center">
            <div className="w-full h-full animate-pulse">
              NONE
            </div>
          </div>
        </>
      );
      break;
    case "waiting":
      buttonClass = "bg-yellow-500 text-black";
      buttonClassL = "bg-yellow-100/50"
      buttonContent = (
        <>
          <svg
            className="size-30 mr-2 animate-spin text-white"
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
          <div className=" w-70 text-center font-bold">Waiting for check... </div>
        </>
      );
      break;
    case "CHECKED":
      buttonClass = "flex w-full h-full bg-blue-800 text-white";
      buttonClassL = "bg-blue-700/40"
      buttonContent = (
        <>
          <span className="relative" >
            <span className="absolute inline-flex animate-ping rounded-full bg-blue-800 opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-blue-800"></span>
          </span>
        </>
      );
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
        {/* Header */}
        <div className={`fixed top-100 flex h-100 w-full backdrop-blur-sm drop-shadow-2xl items-center justify-center ${buttonClassL}`}>
          {/* box1 */}
          <div className="flex flex-col max-h-full w-2/4 justify-center items-center">
            {/* row1 */}
            <div className="flex w-full justify-center items-center">
              <div className="flex text-xl justify-center items-center">
                <div className="text-white font-bold">2312313131231231231123123</div>
              </div>
            </div>
            {/* row2 */}
            <div className="flex w-full mt-2 text-xl text-center justify-center items-center pe-4 ps-4">
              <div className="text-white w-40 font-bold">SMT-1</div>
              <div className="text-white w-60 font-bold">CYN-1231213123-DAS-DK</div>
            </div>
          </div>
          {/* box2 */}
          <div className="flex h-full w-2/4 items-center justify-center">
            <button
              onClick={() => setIsCardOpen(true)}
              type="button"
              className={`flex w-full h-full justify-center items-center px-4 py-2 shadow transition-all duration-300 ${buttonClass}`}
            >
              {buttonContent}
            </button>
          </div>
        </div>


      {/* CARD */}
      {isCardOpen && (
        <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-30 bg-black/20 backdrop-blur-sm">
          <div ref={cardRef} className="grid grid-cols-3 gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6">
            <div className="flex w-full h-full"></div>
            <div
              onClick={() => {
                if (submitStage === "idle") {
                  setSubmitStage("waiting");
                  setIsCardOpen(false);
                  console.log("Submit1");
                } else if (submitStage === "waiting") {
                  setSubmitStage("CHECKED");
                  setIsCardOpen(false);
                  console.log("Submit2");
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
      )}

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
    </div>
  );
};

export default Home;
