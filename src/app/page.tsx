import Image from "next/image";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen w-screen justify-center items-center bg-blue-800 p-6">
      {/* Title Section */}
      <div className="text-white font-kanit text-5xl md:text-6xl font-bold mb-12 text-center">
        HOW TO USE
      </div>

      {/* English Instructions */}
      <div className="flex flex-col text-white w-full max-w-2xl space-y-4">
        <InstructionStep number={1} text="Tap or Click IM Electronic Logo" />
        <InstructionStep number={2} text="The menu will open" />
        <InstructionStep number={3} text="Tap or Click to choose a function" />
      </div>

      {/* Divider */}
      <div className="h-2 w-64 bg-white rounded-full my-12" />

      {/* Thai Title */}
      <div className="text-white font-kanit text-5xl md:text-6xl font-bold mb-12 text-center">
        วิธีใช้งาน
      </div>

      {/* Thai Instructions */}
      <div className="flex flex-col text-white w-full max-w-2xl text-xl space-y-4">
        <InstructionStep number={1} text="แตะ หรือ คลิ๊ก IM Electronic Logo" />
        <InstructionStep number={2} text="เมนูจะเปิดขึ้นมากลางหน้าจอ" />
        <InstructionStep number={3} text="แตะ หรือ คลิ๊ก เลือกฟังก์ชันการทำงาน" />
      </div>

      {/* Optional Image (Uncomment if needed) */}
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
  <div className="flex items-start space-x-3">
    <span className="font-kanit font-semibold">{number}.</span>
    <span className="font-kanit">{text}</span>
  </div>
);

export default Home;
