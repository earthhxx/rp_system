'use client';

import { useEffect, useState } from 'react';

interface HistoryRecord {
  id: number;
  line: string;
  model: string;
  productOrderNo: string;
  status: 'NULL' | 'WAITING' | 'ONCHECKING' | 'CHECKED';
  user: string | null;
  datetime: string;
}

const animetion = {
  WAITING: 'animate-spin-slow',
  ONCHECKING: 'animate-bounce',
  CHECKED: 'animate-ping-slow',
  NULL: '',
};

const icons = {
  CHECKED: (
    <span className="flex items-center justify-center size-[56px]">
      <span className="absolute flex justify-center items-center rounded-full opacity-75 animate-ping z-30">✅</span>
      <span className="z-10 text-[40px] ">✅</span>
    </span>
  ),
  WAITING: "⏳",
  NULL: <div className="size-[56px]"></div>,
  ONCHECKING: (
    <span className="flex items-center justify-center size-[56px]">
      <span className="z-10 text-[40px]">
        <img className="flex" src="/images/circuit-board.png" width={100} height={100} alt="Circuit board" />
      </span>
    </span>
  ),
};

const backgrounds = {
  CHECKED: "bg-pass",
  NULL: "bg-gray-300/40",
  WAITING: "bg-pending ",
  ONCHECKING: "bg-adjusting",
};

const colors = {
  CHECKED: "text-pass",
  NULL: "",
  WAITING: "text-pending",
  ONCHECKING: "text-adjusting",
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/120-9/History?page=${page}&pageSize=${pageSize}`);
        const json = await res.json();
        if (json.success) {
          setHistory(json.data);
          setTotalPages(json.totalPages);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page, pageSize]);

  const filteredLines = () => {
    return history.filter((line) => line.status !== 'NULL');
  };

  const renderLines = () => {
    return filteredLines().map((line) => (
      <div
        key={line.id}
        className={`card ${backgrounds[line.status]} w-full pt-4 ps-4 pe-4 rounded-lg shadow-lg text-center text-black font-kanit`}
      >
        <div className="line-name font-bold text-2xl pb-1">{`${line.id}`}</div>
        <div className={`flex justify-center status text-[36px] ${colors[line.status]} ${animetion[line.status]}`}>{icons[line.status]}</div>
        <div className="model text-[12px] pb-3 text-gray-600">
          {line.status === "WAITING" && (
            <div>WAITING (รอวัด)</div>
          )}
          {line.status === "ONCHECKING" && (
            <div>ON CHECKING (กำลังวัด)</div>
          )}
          {line.status === "CHECKED" && (
            <div>CHECKED (เช็คแล้ว)</div>
          )}
        </div>
        <div>MODEL (โมเดล) </div>
        <div className="model text-[16px] pb-2">{`${line.model}`}</div>
        <div className="last-measured text-sm text-gray-600 pb-1">
          {/* ตรวจสอบว่า datetime ไม่เป็น undefined หรือ null */}
          {line.datetime ? `Start time (เวลา เริ่ม):\n ${line.datetime.replace("T", " ").substring(0, 19)}` : 'Start time: Not available'}
        </div>
      </div>
    ));
  };

  const paginate = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
    }
  };

  const renderPagination = () => {
    const maxButtons = 5;
    const pageNumbers = [];

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (page <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }

    return (
      <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
        <button
          className={`px-4 py-2 rounded ${page === 1 ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
          onClick={() => paginate(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>

        {pageNumbers.map((num, idx) =>
          num === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <button
              key={num}
              className={`px-4 py-2 rounded ${page === num ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
              onClick={() => paginate(num as number)}
            >
              {num}
            </button>
          )
        )}

        <button
          className={`px-4 py-2 rounded ${page === totalPages ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
          onClick={() => paginate(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    );
  };


  return (
    <div className="min-h-screen w-full p-4 bg-gray-100 backdrop-blur-3xl flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-center">Reflow Log History</h1>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="p-6 m-1 w-full">
            <div className="font-bold grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-5 gap-y-10 w-full h-full">
              {renderLines()}
            </div>
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
}
