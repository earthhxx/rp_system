// components/EmployeeIdCard.tsx
import React from 'react';
import { BsUpcScan } from 'react-icons/bs';
import { GoCheckCircle } from 'react-icons/go';

interface EmployeeIdCardProps {
  cardRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  employeeName: string;
  employeeNo?: string;
  onChangeID: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScan: () => void;
  onSubmit: () => void;
  isPassword?: boolean;
  children?: React.ReactNode;
}

const EmployeeIdCard: React.FC<EmployeeIdCardProps> = ({
  cardRef,
  inputRef,
  employeeName,
  employeeNo,
  onChangeID,
  onScan,
  onSubmit,
  isPassword = false,
  children,
}) => {
  return (
    <div className="absolute flex flex-col w-screen h-screen justify-center items-center z-45 bg-black/20 backdrop-blur-sm">
      <div
        ref={cardRef}
        className="text-[14px] xl:text-xl transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-110 xl:size-160 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl mb-5 p-6"
      >
        <div className="text-white text-center">
          Please enter your Employee ID :
          <br />
          โปรดใส่รหัสพนักงานของคุณ :
          <br />
          CHECK YOUR ID = {employeeName || "ไม่มีข้อมูล"}
        </div>

        <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>

        <input
          ref={inputRef}
          type={isPassword ? "password" : "text"}
          autoComplete="off"
          value={employeeNo}
          onChange={onChangeID}
          placeholder="รหัสพนักงาน"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 p-2.5 block w-full focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />

        {children}

        <div className="flex w-full h-full items-center">
          <div onClick={onScan} className="flex flex-col justify-center items-center font-kanit w-1/2 text-white">
            <BsUpcScan className="size-15 xl:size-32" />
            <div>SCAN</div>
            <div>สแกน</div>
          </div>
          <div onClick={onSubmit} className="flex flex-col justify-center items-center font-kanit w-1/2 text-white">
            <GoCheckCircle className="size-15 xl:size-30" />
            <div>SUBMIT</div>
            <div>ส่งข้อมูล</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeIdCard;
