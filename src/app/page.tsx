import Image from "next/image";

const Home = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-blue-100">
      {/* Header */}
      <div className="h-32 w-3/4 bg-blue-800/60 backdrop-blur-lg drop-shadow-2xl flex justify-center items-center">
        <div className="grid grid-cols-4 gap-x-4 gap-y-2 p-4 h-full w-full bg-amber-600 place-items-center">

          {/* Row 1 */}
          <div className="col-span-1">PRODUCT :</div>
          <input type="text" className="col-span-1 px-2 py-1 border rounded" placeholder="Enter Product" />

          <div className="col-span-2 h-5"></div>

          {/* Row 2 */}
          <div className="col-span-1">LINE :</div>
          <input type="text" className="col-span-1 px-2 py-1 border rounded" placeholder="Enter Line" />
          <div className="col-span-1">MODEL :</div>
          <input type="text" className="col-span-1 px-2 py-1 border rounded" placeholder="Enter Model" />

        </div>
        <div className="flex flex-col justify-center items-center">
          <button type="button" className="bg-indigo-500 ..." disabled>
            <svg className="mr-3 size-5 animate-spin ..." viewBox="0 0 24 24">
              !-- ... --
            </svg>
            Processing…
          </button>
        </div>
      </div>



      <div className="flex h-full w-full">
        <Image
          src="/images/Test Reflow Temp_page-0001.jpg"
          alt="Menu Image"
          width={819}
          height={1093}
          className="w-full h-full "
        />
      </div>
    </div>
  );
}

export default Home;