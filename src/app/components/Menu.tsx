import React from "react";
import Image from "next/image";

const Menu = () => {
  return (
    <div className="relative justify-center items-center">
      {/* Button im */}
      <div className="absolute top-100 left-0 size-15 rounded-2xl bg-black/80 backdrop-blur-md shadow-md flex flex-col justify-center items-center drop-shadow-xl"> </div>
      <div className="absolute top-100 left-0 size-15 rounded-2xl shadow-md flex flex-col justify-center items-center">
        <div className="flex flex-col size-15 bg-white blur-[4] rounded-2xl justify-center items-center mr-[2px]">
          <div className="">
            <Image
              src="/images/LOGO3.png"
              alt="Menu Image"
              width={50}
              height={50}
              className=""
            />
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="absolute flex flex-col w-screen h-screen  justify-center items-center">
        <div className=" flex size-150 rounded-2xl bg-black/50 backdrop-blur-md shadow-md justify-center items-center drop-shadow-xl"> </div>
      </div>


    </div>
  );
};

export default Menu;
