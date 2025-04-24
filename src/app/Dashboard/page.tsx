"use client";
import React, { useState, useRef, useEffect } from "react";


const MenuToggle = () => {
    return (
        <>
        <div ></div>
            <div className="flex-1 w-screen h-screen flex-col justify-center items-start bg-blue-800">
                <div className="flex w-full h-50 text-5xl font-kanit  font-bold justify-center items-center">REFLOW PROFLIE DASHBOARD</div>
                <div className="flex flex-none ps-4 pe-4">
                    <div className="flex w-1/2 items-center justify-between px-4 py-3 space-x-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50">
                        <div className="flex w-full justify-center items-center space-x-4">
                            <div>
                                <p className="text-sm font-medium text-gray-900">ProductOrderNo</p>
                                <p className="text-xs text-gray-500">202508040022</p>
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-center space-x-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                                Active
                            </span>
                        </div>
                        <div className="flex w-full items-center justify-center space-x-4">
                            <button type="button" className="text-sm text-blue-600 hover:underline">Edit</button>
                            <button type="button" className="text-sm text-red-600 hover:underline">Delete</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default MenuToggle;