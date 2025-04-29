"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { BsUpcScan, BsClipboard2DataFill } from "react-icons/bs";
import { motion } from "framer-motion";
import { useRouter, usePathname, } from "next/navigation";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { AiFillHome } from "react-icons/ai";
import { VscSignIn } from "react-icons/vsc";

interface ReflowStatus {
    ST_Line: string;
    ST_Model: string;
    ST_Prod: string;
    ST_Status: string;
}

const MenuToggle = () => {
    const router = useRouter();
    const [homeStage, setHomeStage] = useState<"home" | "scan" | "dashboard" | "menuOpen">("home");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 500 });
    const [dragBounds, setDragBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
    const [productOrderNo, setProductOrderNo] = useState("");
    const cardRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const qrRegionId = "qr-reader";
    const inputRef = useRef<HTMLInputElement | null>(null);

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickOutsideMenu = menuRef.current && !menuRef.current.contains(event.target as Node);
            const isClickOutsideCard = cardRef.current && !cardRef.current.contains(event.target as Node);

            // ถ้าเปิดเมนูอยู่ แล้วคลิกข้างนอก ให้ปิดเมนู
            if (homeStage === "menuOpen" && isClickOutsideMenu) {
                setIsMenuOpen(false);
                setHomeStage("home");

            }

            // ถ้าอยู่หน้า scan แล้วคลิกข้างนอก card ให้กลับ home
            if (homeStage === "scan" && isClickOutsideCard) {
                setHomeStage("home");
                clearCamera();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [homeStage]);

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
                    setProductOrderNo(decodedText);
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
    const clearinputref = () => {
        // เคลียร์ inputRef และ state
        if (inputRef.current) {
            inputRef.current.value = "";
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

    const renderHomeButton = () => (
        <motion.div
            className="fixed h-fit w-fit justify-center items-center pb-8 pt-5 pl-3 pr-3 z-95"
            whileTap={{ scale: 0.9 }}
            drag
            dragConstraints={dragBounds}
            dragElastic={0.2}
            style={{ x: position.x, y: position.y }}
            onDragEnd={(e, info) => {
                setPosition({ x: info.point.x, y: info.point.y });
            }}
        >
            <div className="flex flex-col size-[62px] justify-start items-start z-10 animate-bounce">
                <div className="fixed flex flex-col size-[62px] bg-black/70 blur-[4] rounded-2xl justify-center items-center mr-[3px] mt-[2px] ml-[2px] cursor-pointer z-10 drop-shadow-2xl"></div>
                <div
                    className="fixed flex flex-col size-15 bg-white blur-[4] rounded-2xl justify-center items-center mr-[2px] cursor-pointer z-20"
                    onClick={() => {
                        setIsMenuOpen(true);
                        setHomeStage("menuOpen");
                    }}
                >
                    <Image src="/images/LOGO3.png" alt="Menu Image" width={50} height={50} draggable={false} />
                </div>
                <span className="relative top-0 left-12 inline-flex size-3 rounded-full bg-blue-800 z-40">
                    <span className="absolute inline-flex size-3 h-full w-full animate-ping rounded-full bg-sky-700 opacity-75 z-50" />
                </span>
            </div>
        </motion.div>
    );

    const renderMenu = () => (
        <div className="fixed inset-0 flex flex-col w-screen h-screen justify-center items-center z-95 bg-black/20 backdrop-blur-sm">
            <div
                ref={menuRef}
                className="grid grid-cols-3 gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6"
            >
                <div className="flex w-full h-full"></div>
                <div
                    onClick={() => {

                        setHomeStage('home');
                        setIsMenuOpen(false);
                        router.push('/');
                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white">
                    <AiFillHome className="size-30 text-white m-4" />
                    HOME
                </div>
                <div className="flex w-full h-full"></div>
                <div
                    onClick={() => {
                        console.log("test onclick dashboard");
                        setHomeStage('home'); //idk why tf setIsMenuOpen(false); not working
                        router.push('/Dashboard');

                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white">

                    <BsClipboard2DataFill className="size-30 text-white m-4" />
                    REALTIME CHECK
         

                </div>
                <div className="flex w-full h-full"></div>
                <div
                    onClick={() => {
                        setHomeStage("scan");
                        setIsMenuOpen(false);
                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white cursor-pointer"
                >
                    <BsUpcScan className="size-30 text-white m-4" />
                    STANDARD SEARCH
                </div>
                <div className="flex w-full h-full"></div>
                <div className="flex flex-col justify-center items-center w-full h-full text-white">
                    <VscSignIn className="size-30 text-white m-4" />
                    SIGN IN
                </div>
                <div className="flex w-full h-full"></div>
            </div>
        </div>
    );

    const renderScanCard = () => {
        if (homeStage !== "scan") return null;

        return (

            <div className="fixed inset-0 flex flex-col w-screen h-screen justify-center items-center z-95 bg-black/20 backdrop-blur-sm">

                <div
                    ref={cardRef}
                    className="transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl h-fit p-6"
                >
                    <div className="flex justify-center items-center w-full text-white">
                        Please enter Product ID :
                    </div>
                    <div className="flex justify-center items-center w-full text-white">
                        โปรดใส่รหัสผลิตภัณฑ์ของคุณ :
                    </div>
                    <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={productOrderNo}
                        id="product_id"
                        onChange={(e) => setProductOrderNo(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="product id..."
                    />
                    <div className="flex w-full h-fit items-center">
                        <span
                            onClick={startScan}
                            className="flex w-1/2 h-32 justify-center">
                            <BsUpcScan className="size-32 text-white" />
                        </span>
                        <div
                            onClick={() => {
                                handleNextPageStatus();
                                clearinputref();
                            }}

                            className="flex flex-col text-4xl font-bold justify-center items-center font-roboto w-1/2 size-32 bg-green-600 rounded-full cursor-pointer"
                        >
                            SUBMIT
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleNextPageStatus = () => {
        const value = inputRef.current?.value.trim();

        if (!value) {
            alert("กรุณากรอกหรือสแกนรหัสก่อนเข้าสู่หน้าถัดไป");
            return;
        }
        setHomeStage("home");
        const query = encodeURIComponent(productOrderNo); // ป้องกันปัญหา URL พิเศษ
        router.push(`/StatusPage?productOrderNo=${query}`);
        clearinputref();
    };

    return (
        <>
            {homeStage === "home" && renderHomeButton()}
            {homeStage === "menuOpen" && renderMenu()}
            {homeStage === "scan" && renderScanCard()}

            <div className="absolute bottom-5 left-5 text-white">
                Position: {`X: ${position.x}, Y: ${position.y}`}
            </div>
        </>
    );
};

export default MenuToggle;
