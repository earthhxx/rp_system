import React from "react";

const Menu = () => {
  return (
    <div className="relative justify-center items-center">
      <div className="absolute top-100 left-0 h-50 w-15 rounded-2xl bg-black flex flex-col justify-center items-center">
        <div className="flex flex-col text-center">
          <span className="text-4xl font-extrabold"
            style={{
              writingMode: 'vertical-lr',
              textOrientation: 'upright',
            }}
          >
            MENU
          </span>
        </div>
      </div>
    </div>
  );
};

export default Menu;
