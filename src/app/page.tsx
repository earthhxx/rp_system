import Image from "next/image";

const Home = () => {
    return (
     
        <div className="flex flex-col h-screen w-screen justify-center items-center bg-blue-800">
            <div className="flex w-full h-50 text-5xl font-no font-bold justify-center items-center"> HOW TO USE </div>
            <div className="flex w-full justify-center p-4"> Tap or Click IM Electronic Logo icon</div>
            <div className="flex">
            <Image
                      src="/images/menu.png"
                      alt="Menu Image"
                      width={250}
                      height={250}
                      className="w-full h-full rounded-xl"
                    />
            </div>
            <div className="flex w-full justify-center p-4"> The menu will open  </div>
            
        </div>
    );
};

export default Home;
