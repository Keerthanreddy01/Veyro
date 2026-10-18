import CrossSVG from "@/components/CrossSVG";
import { ReactNode } from "react";

export default function GridItemCover({ children }: { children: ReactNode }) {
  return (
    <div className="relative p-2.5 sm:p-3 first:border-l border-r max-sm:border-x border-x-gray w-full max-w-[270px] flex-1 min-h-[215px]">
      <CrossSVG className="absolute -left-3 -bottom-3 pointer-events-none" />
      <CrossSVG className="absolute -right-3 -bottom-3 pointer-events-none" />
      <CrossSVG className="absolute -left-3 -top-3 pointer-events-none" />
      <CrossSVG className="absolute -right-3 -top-3 pointer-events-none" />
      {children}
    </div>
  );
}
