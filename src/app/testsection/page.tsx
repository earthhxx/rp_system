'use client';
import React, { useState, useRef, useEffect } from 'react';

const TestPage = () => {
  const [employeeNo, setEmployeeNo] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeUserName, setEmployeeUserName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChangeInputID = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length === 4) {
      setEmployeeNo(value);
    }
  };

  useEffect(() => {
    const fetchEmployeeName = async () => {
      try {
        const res = await fetch(`/api/120-2/select-Employee-id?UserName=${employeeNo}`);
        const { success, data } = await res.json();

        if (success && data?.Name && data?.UserName) {
          setEmployeeName(data.Name);
          setEmployeeUserName(data.UserName);
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
      }
    };

    if (employeeNo) fetchEmployeeName();
  }, [employeeNo]);

  return (
    <div className="p-6 max-w-md mx-auto ">
      <input
        ref={inputRef}
        type="text"
        maxLength={4}
        autoComplete="off"
        onChange={handleChangeInputID}
        className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="รหัสพนักงาน"
      />

      {employeeName && (
        <div className="mt-4 text-sm text-black dark:text-white">
          <p>ชื่อพนักงาน: {employeeName}</p>
          <p>Username: {employeeUserName}</p>
        </div>
      )}
    </div>
  );
};

export default TestPage;
