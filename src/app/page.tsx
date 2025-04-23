import Image from "next/image";


const Home = () => {
    return (
     
        <div className="flex flex-col h-screen w-screen justify-center items-center bg-blue-800">
            <div className="flex w-full h-fit text-5xl font-bold justify-center items-center"> HOW TO USE </div>
            <div className="flex w-full h-fit text-7xl font-bold justify-center items-center"> วิธีใช้งาน </div>
            <div className={`font-kanit flex w-full h-fit text-7xl justify-center items-center`}> วิธีใช้งาน </div>
            <div className="flex w-full justify-center p-4"> Tap or Click IM Electronic Logo</div>
            <div className={`font-kanit flex w-full justify-center p-4`}> แตะ หรือ กด IM Electronic</div>
            <div className="flex">
            {/* <Image
                      src="/images/menu.png"
                      alt="Menu Image"
                      width={250}
                      height={250}
                      className="w-full h-full rounded-xl"
                    /> */}
            </div>
            <div className="flex w-full justify-center p-4"> The menu will open  </div>
            <div className="flex w-full justify-center p-4"> เมนู จะเปิด ขึ้นมากลางหน้าจอ  </div>
            
        </div>
    );
};

export default Home;
