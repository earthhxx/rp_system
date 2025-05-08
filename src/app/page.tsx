import Image from "next/image";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen max-h-screen w-screen justify-center items-center bg-blue-800 p-4">
      {/* Title Section */}
      <h1 className="text-white font-kanit text-3xl md:text-4xl font-bold mb-3 text-center">
        HOW TO USE
      </h1>

      {/* English Instructions */}
      <div className="flex flex-col w-full max-w-md space-y-4">
        <InstructionStep number={1} text="Tap or Click IM Electronic Logo" />
        <InstructionStep number={2} text="The menu will open" />
        <InstructionStep number={3} text="Tap or Click to choose a function" />
      </div>

      {/* Divider */}
      <div className="h-1 w-20 bg-white rounded-full my-3" />

      {/* Thai Title */}
      <h1 className="text-white font-kanit text-3xl md:text-4xl font-bold mb-3 text-center">
        วิธีใช้งาน
      </h1>

      {/* Thai Instructions */}
      <div className="flex flex-col w-full max-w-md space-y-4">
        <InstructionStep number={1} text="แตะ หรือ คลิ๊ก IM Electronic Logo" />
        <InstructionStep number={2} text="เมนูจะเปิดขึ้นมากลางหน้าจอ" />
        <InstructionStep number={3} text="แตะ หรือ คลิ๊ก เลือกฟังก์ชันการทำงาน" />
      </div>
    </div>
  );
};

interface InstructionStepProps {
  number: number;
  text: string;
}

const InstructionStep = ({ number, text }: InstructionStepProps) => (
  <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-3 shadow-md space-x-3">
    <div className="flex justify-center items-center bg-white text-blue-800 font-bold rounded-full w-8 h-8">
      {number}
    </div>
    <div className="text-white font-kanit text-sm">
      {text}
    </div>
  </div>
);

export default Home;
