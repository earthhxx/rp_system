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
      <div className="flex h-32 w-full bg-blue-800/60 backdrop-blur-lg drop-shadow-2xl items-center justify-center px-8">
        <div className="flex flex-col h-32 w-full justify-center items-center">
          <div className="flex w-full">
            <div className="flex items-center space-x-4 w-3/5">
              <label className="text-white w-24">PRODUCT :</label>
              <input type="text" className="flex-grow p-2 rounded-md" />
            </div>
            <div className="w-2/5 flex justify-end">
            </div>
          </div>
          <div className="flex w-full">
            <div className="flex items-center space-x-4 w-3/5">
              <label className="text-white w-24">LINE :</label>
              <input type="text" className="flex-grow p-2 rounded-md" />
            </div>
            <div className="flex items-center space-x-4 w-3/5">
              <label className="text-white w-24">MODEL :</label>
              <input type="text" className="flex-grow p-2 rounded-md" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button
            onClick={() => setIsCardOpen(true)}
            type="button"
            className={`flex items-center px-4 py-2 rounded-md shadow transition-all duration-300 ${submitStage === "idle"
                ? "bg-indigo-500 text-white"
                : submitStage === "waiting"
                  ? "bg-yellow-500 text-black"
                  : "bg-green-600 text-white"
              }`}
          >
            {submitStage === "idle" && (
              <>
                <svg
                  className="mr-2 w-5 h-5 animate-spin text-white"
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
                Processing…
              </>
            )}

            {submitStage === "waiting" && "Waiting for Confirm..."}

            {submitStage === "CHECKED" && "Submitted ✔"}
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
                  Home(refresh)
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
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
};

export default Home;
