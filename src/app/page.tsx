import Image from "next/image";

const Home = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-blue-100 ">
      <div className="flex flex-col h-35 w-full bg-blue-800/60 backdrop-blur-lg drop-shadow-2xl0 justify-center items-center">
        <div className="grid grid-cols-8 gap-4 p-4 h-full w-full bg-amber-600 justify-center items-center place-items-center">
          <div className="start-1">PRODUCT : </div>
          <input className="col-span-4 start-2">1</input>
          <div className="start-9">LINE : </div>
          <input className="col-span-4 start-10"></input>
          <div className="start-17">MODEL</div>
          <input className="col-span-4 start-18">2</input>
        </div>

      </div>
      <div className="flex h-80 w-full">
          <Image
            src="/images/Test Reflow Temp_page-0001.jpg"
            alt="Menu Image"
            width={819}
            height={1093}
            className="w-screen h-screen"
          />
      </div>
    </div>
  );
}

export default Home;