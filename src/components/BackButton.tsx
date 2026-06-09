import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(-1)}
      className="fixed top-4 right-20 md:top-6 md:right-24 flex items-center justify-center space-x-2 px-3 py-2 md:w-10 md:h-10 md:px-0 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-gray-300 hover:text-white transition-all shadow-lg border border-white/10 z-[60]"
      title="Go Back"
    >
      <ArrowLeft className="w-5 h-5 shrink-0" />
      <span className="md:hidden text-sm font-medium pr-1">Back</span>
    </button>
  );
}
