import { AudioLines } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 rotate-[-3deg] items-center justify-center rounded-lg bg-black text-white">
        <AudioLines className="size-5" strokeWidth={2.4} />
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.35px]">Hanzi Flow</span>
    </div>
  );
}
