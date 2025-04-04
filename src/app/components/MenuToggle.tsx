"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { GoAlertFill,GoSkipFill,GoCheckCircle } from "react-icons/go";
import { BsUpcScan,BsClipboard2DataFill } from "react-icons/bs";

const MenuToggle = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
                <div className="relative ">
                    <div className="absolute top-70 left-0 flex flex-col w-screen justify-start items-start z-10">
                        <div className="fixed flex flex-col size-[62px] bg-black/70 blur-[4] rounded-2xl justify-center items-center mr-[3px] mt-[2px] ml-[2px] cursor-pointer z-10 drop-shadow-2xl">
                        </div>
                        <div
                            className="fixed flex flex-col size-15 bg-white blur-[4] rounded-2xl justify-center items-center mr-[2px] cursor-pointer z-20"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Image
                                src="/images/LOGO3.png"
                                alt="Menu Image"
                                width={50}
                                height={50}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* MENU */}
            {isMenuOpen && (
                <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-10 bg-black/20 backdrop-blur-sm">
                    <div
                        ref={menuRef}
                        className="grid grid-cols-4 gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6"
                    >
                        <div>
                            <GoAlertFill className="text-white text-4xl" />
                        </div>
                        <div>
                            <GoSkipFill />
                        </div>
                        <div>
                            <BsClipboard2DataFill />
                        </div>
                        <div>
                        <BsUpcScan />
                        </div>
                        <div>
                        <GoCheckCircle />
                        </div>
                        {/* Add more menu items here */}
                    </div>
                </div>
            )}
        </>
    );
};

export default MenuToggle;
