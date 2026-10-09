import { CSSProperties } from "react";

const CalLogo = (props: { className?: string; style?: CSSProperties }) => (
  <div
    className={`w-10 h-10 rounded-[10px] bg-[#171717] flex items-center justify-center font-cal text-white font-bold text-lg select-none relative shadow-sm ${props.className || ""}`}
    style={props.style}
  >
    <span>v</span>
    <span className="text-[#60C5F1] leading-none">.</span>
  </div>
);

export default CalLogo;

