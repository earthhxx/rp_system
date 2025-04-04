import Image from "next/image";

const Home = () => {
  return (
    <div className="flex h-screen w-screen justify-center items-center bg-blue-100">
      <Image
        src="/images/Test Reflow Temp_page-0001.jpg"
        alt="Menu Image"
        width={819}
        height={1093}
        className="w-screen h-screen"
      />
    </div>
  );
}

export default Home;