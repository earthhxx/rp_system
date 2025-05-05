'use client';

import { useEffect, useState } from 'react';

type StatusType = 'WAITING' | 'ONCHECKING' | 'CHECKED' | 'NULL' | 'close' | 'cancel';

interface HistoryRecord {
  line: string;
  model: string;
  status: StatusType;
  Datetime: string;
  Log_Status?: string; // Add Log_Status as an optional property
  Log_Model?: string; // Add Log_Model as an optional property
  Log_Line?: string; // Add Log_Line as an optional property
  id?: string; // Add Log_id as an optional property
}


const animetion = {
  WAITING: 'text-center animate-spin-slow',
  ONCHECKING: ' animate-bounce',
  CHECKED: 'animate-ping-slow',
  NULL: ' text-center',
  close: ' text-center',
  cancel: ' text-center',
};

const icons = {
  CHECKED: (
    <span className="flex items-center justify-center ">
      <span className="absolute flex justify-center items-center rounded-full opacity-75 animate-ping z-30">✅</span>
      <span className="z-10 text-[20px] ">✅</span>
    </span>
  ),
  WAITING: "⏳",
  NULL: <div className='flex items-center justify-center text-[20px]'>null</div>,
  close: <div className='flex items-center justify-center text-[20px]'>null</div>,
  cancel: <div className='flex items-center justify-center text-[20px]'>null</div>,
  ONCHECKING: (
    <span className="flex items-center justify-center">
      <span className="z-10 text-[20px] size-[26px]">
        <img className="flex" src="/images/circuit-board.png" width={100} height={100} alt="Circuit board" />
      </span>
    </span>
  ),
};

const backgrounds = {
  CHECKED: " bg-pass ",
  NULL: " bg-gray-300 ",
  close: " bg-gray-300 ",
  cancel: " bg-gray-300 ",
  WAITING: " bg-pending ",
  ONCHECKING: " bg-adjusting ",
};

const colors = {
  CHECKED: "text-pass",
  NULL: "text-gray-500",
  close: "text-gray-500",
  cancel: "text-gray-500",
  WAITING: "text-pending",
  ONCHECKING: " text-adjusting ",
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(14);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/120-9/History?page=${page}&pageSize=${pageSize}`);
        const json = await res.json();
        if (json.success) {
          // Clean status here
          const cleanedData = json.data.map((item: any) => {
            console.log('Raw item from API:', item); // เช็คตรงนี้ดูว่ามี Log_Status ไหม

            const rawStatus = item.Log_Status;
            const finalStatus =
              rawStatus === 'ONCHECKING'
                ? 'ONCHECKING'
                : rawStatus ?? 'NULL';

            return {
              id: item.id ?? '',
              model: item.Log_Model ?? 'Unknown',
              line: item.Log_Line ?? 'Unknown',
              Datetime: item.Datetime ?? '',
              status: finalStatus,
            };
          });
          console.log('Cleaned data:', cleanedData); // เช็คตรงนี้ดูว่ามี Log_Status ไหม          

          setHistory(cleanedData);
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
    return (
      <div className="overflow-x-auto w-full p-4 rounded-2xl ">
        <table className="w-full rounded-2xl bg-gray-50 text-sm sm:text-[10px] font-kanit ">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="px-4 py-2 text-left rounded-tl-2xl">ID</th>
              <th className="px-4 py-2 text-left">Line</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left rounded-tr-2xl ">Time</th>
            </tr>
          </thead>
          <tbody className='rounded-2xl'>
            {filteredLines().map((line) => (
              <tr
                key={`${line.id}-${line.Datetime}`}
                className={`${backgrounds[line.status]} transition duration-300 hover:bg-yellow-100`}
              >
                <td className="border px-4 py-2 ">{line.id}</td>
                <td className="border px-4 py-2">{line.line}</td>
                <td className="border px-4 py-2 grid grid-cols-2 items-center justify-center gap-2">
                  <span className={`${colors[line.status]} text-xl ${animetion[line.status]}`}>
                    {icons[line.status]}
                  </span>
                  <span>
                    {line.status === "WAITING" && "WAITING (รอวัด)"}
                    {line.status === "ONCHECKING" && "ONCHECKING (กำลังวัด)"}
                    {line.status === "CHECKED" && "CHECKED (เช็คแล้ว)"}
                    {line.status === "NULL" && "NULL (ไม่มีข้อมูล)"}
                    {line.status === "close" && "CLOSED (ปิดไลน์)"}
                    {line.status === "cancel" && "CANCELED (ยกเลิกการผลิต)"}
                  </span>
                </td>
                <td className="border px-4 py-2">{line.model}</td>
                <td className="border px-4 py-2">
                  {line.Datetime
                    ? line.Datetime.replace("T", " ").substring(0, 19)
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
          <div className="p-6 m-1 w-full rounded-2xl drop-shadow-2xl backdrop-blur-3xl ">
            <div className="font-bold grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-1 gap-5 gap-y-10 w-full h-full rounded-2xl drop-shadow-2xl p-4">
              {renderLines()}
            </div>

          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
}
