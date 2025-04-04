"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { GoSkipFill, GoCheckCircle } from "react-icons/go";
import { BsUpcScan, BsClipboard2DataFill } from "react-icons/bs";
import { motion } from "framer-motion";

const MenuToggle = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 500 });
    const [dragBounds, setDragBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });

    useEffect(() => {
        if (typeof window !== "undefined") {
            setDragBounds({
                left: 0,
                top: 0,
                right: window.innerWidth - 80,
                bottom: window.innerHeight - 80,
            });
        }
    }, []);

    // Event listener to close menu if clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };


        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <>
            {/* Button */}
            {!isMenuOpen && (
                <motion.div
                    className="fixed h-fit w-fit justify-center items-center pb-8 pt-5 pl-3 pr-3 z-90"
                    whileTap={{ scale: 0.9 }}
                    drag
                    dragConstraints={dragBounds}
                    dragElastic={0.2}
                    style={{ x: position.x, y: position.y }}
                    onDragEnd={(e, info) => {
                        setPosition({ x: info.point.x, y: info.point.y });
                    }}
                >
                    <div className="flex flex-col size-[62px] justify-start items-start z-10 animate-bounce ">
                        <div className="fixed flex flex-col size-[62px] bg-black/70 blur-[4] rounded-2xl justify-center items-center mr-[3px] mt-[2px] ml-[2px] cursor-pointer z-10 drop-shadow-2xl "></div>
                        <div
                            className="fixed flex flex-col size-15 bg-white blur-[4] rounded-2xl justify-center items-center mr-[2px] cursor-pointer z-20 "
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Image
                                src="/images/LOGO3.png"
                                alt="Menu Image"
                                width={50}
                                height={50}
                            />
                        </div>
                        <span className="relative top-0 left-12 inline-flex size-3 rounded-full bg-blue-800 z-40">
                            <span className="absolute inline-flex size-3 h-full w-full animate-ping rounded-full bg-sky-700 opacity-75 z-50">
                            </span>
                        </span>


                    </div>
                </motion.div>
            )}

            {/* MENU */}
            {isMenuOpen && (
                <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-10 bg-black/20 backdrop-blur-sm">
                    <div ref={menuRef} className="grid grid-cols-3 gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6">
                        <div className="flex w-full h-full"></div>
                        <div className="flex flex-col justify-center items-center w-full h-full">
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

            {/* Showing Position */}
            <div className="absolute bottom-5 left-5 text-white">
                Position: {`X: ${position.x}, Y: ${position.y}`}
            </div>
        </>
    );
};

export default MenuToggle;
