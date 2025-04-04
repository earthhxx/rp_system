import Image from "next/image";

const Home = () => {
  return (
    <div className="flex h-screen w-screen justify-center items-center bg-blue-100">
        <Image
                      src="/images/bg.jpg"
                      alt="Menu Image"
                      width={50}
                      height={50}
                      className="w-screen h-screen"
                    />
    </div>
  );
}

export default Home;