import React from "react";
import Image from "next/image";

const Menu = () => {
  return (
    <div className="relative justify-center items-center">
      <div className="absolute top-100 left-0 size-30 rounded-full bg-radial bg-black/10 backdrop-blur-3xl flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center">
          <div className="">
          <Image
              src="/images/LOGO3.png" 
              alt="Menu Image" 
              width={75} 
              height={75} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
