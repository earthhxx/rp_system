import Image from "next/image";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen w-screen justify-center items-center bg-blue-800 p-6">
      {/* Title Section */}
      <h1 className="text-white font-kanit text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center">
        HOW TO USE
      </h1>

      {/* English Instructions */}
      <div className="flex flex-col w-full max-w-lg md:max-w-xl lg:max-w-2xl space-y-6">
        <InstructionStep number={1} text="Tap or Click IM Electronic Logo" />
        <InstructionStep number={2} text="The menu will open" />
        <InstructionStep number={3} text="Tap or Click to choose a function" />
      </div>

      {/* Divider */}
      <div className="h-1 w-24 md:w-32 bg-white rounded-full my-4 md:my-8" />

      {/* Thai Title */}
      <h1 className="text-white font-kanit text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center">
        วิธีใช้งาน
      </h1>

      {/* Thai Instructions */}
      <div className="flex flex-col w-full max-w-lg md:max-w-xl lg:max-w-2xl space-y-6">
        <InstructionStep number={1} text="แตะ หรือ คลิ๊ก IM Electronic Logo" />
        <InstructionStep number={2} text="เมนูจะเปิดขึ้นมากลางหน้าจอ" />
        <InstructionStep number={3} text="แตะ หรือ คลิ๊ก เลือกฟังก์ชันการทำงาน" />
      </div>

      {/* Optional Image */}
      {/* 
      <div className="mt-12">
        <Image
          src="/images/menu.png"
          alt="Menu Image"
          width={250}
          height={250}
          className="rounded-xl"
        />
      </div>
      */}
    </div>
  );
};

interface InstructionStepProps {
  number: number;
  text: string;
}

const InstructionStep = ({ number, text }: InstructionStepProps) => (
  <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md space-x-4">
    <div className="flex justify-center items-center bg-white text-blue-800 font-bold rounded-full w-8 h-8 md:w-10 md:h-10">
      {number}
    </div>
    <div className="text-white font-kanit text-sm md:text-base lg:text-lg">
      {text}
    </div>
  </div>
);

export default Home;
