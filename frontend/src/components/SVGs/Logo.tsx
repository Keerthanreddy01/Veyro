import React, { CSSProperties } from "react";

const Logo = (props: { style?: CSSProperties; className?: string }) => {
  return (
    <div
      style={props.style}
      className={`inline-flex items-center gap-1 select-none ${props.className || ""}`}
    >
      <span className="font-cal text-[26px] tracking-tight text-primary-black font-bold lowercase leading-none">
        veyro<span className="text-[#60C5F1]">.</span>
      </span>
    </div>
  );
};

export default Logo;
