const Logo = ({ className, textClassName }: { className?: string; textClassName?: string }) => (
  <div className={`flex items-center gap-2 font-bold tracking-tight text-white select-none ${className || ''}`}>
    <div className="w-7 h-7 rounded-lg bg-[#bef264] text-black flex items-center justify-center font-black text-sm shadow-[0_0_12px_rgba(190,242,100,0.6)]">
      T
    </div>
    <span className={`text-base font-extrabold tracking-wider font-mono ${textClassName || ''}`}>
      TECH<span className="text-[#bef264]">STORE</span>
    </span>
  </div>
);

export default Logo;

