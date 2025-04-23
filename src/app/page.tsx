import Image from "next/image";


const Home = () => {
    return (
        <div className="flex flex-col h-screen w-screen justify-center items-center bg-blue-800">
            <div className="flex flex-row items-center">
                <div className="font-kanit text-white flex w-full h-fit text-[70px] font-bold justify-center items-center"> HOW TO USE </div>
                <div className="flex flex-col text-white">
                    <div className="font-kanit flex w-full justify-start pt-4 pe-8">1. Tap or Click IM Electronic Logo</div>
                    <div className="font-kanit flex w-full justify-start pt-4">2. The menu will open </div>
                    <div className="font-kanit flex w-full justify-start pt-4">3. Tap or Click to choose use function</div>
                    <div className="flex h-10"></div>
                </div>
            </div>
            <div className="rounded-full bg-white h-2 w-220 m-4"></div>
            <div className="flex flex-row items-center">
                    <div className="font-kanit text-white flex w-full h-fit text-[98px] font-normal justify-center items-center"> วิธีใช้งาน </div>
                    <div className="flex flex-col text-xl text-white mt-4">
                        <div className={`font-kanit flex w-full justify-start pt-4`}>1. แตะ หรือ คลิ๊ก IM Electronic Logo</div>
                        <div className="font-kanit flex w-full justify-start pt-4">2. เมนูจะเปิดขึ้นมากลางหน้าจอ  </div>
                        <div className="font-kanit  flex w-full justify-start pt-4">3. แตะ หรือ คลิ๊ก เลือกฟังชั่นการทำงาน  </div>
                        <div className="flex">
                            {/* <Image
                      src="/images/menu.png"
                      alt="Menu Image"
                      width={250}
                      height={250}
                      className="w-full h-full rounded-xl"
                    /> */}
                        </div>
                    </div>
                </div>



        </div>
    );
};

export default Home;
