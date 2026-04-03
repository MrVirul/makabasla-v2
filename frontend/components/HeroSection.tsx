export default function HeroSection() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center p-12 pt-40 text-center font-sans tracking-tight">
      <div className="max-w-3xl flex flex-col items-center gap-10">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#F5A623]">
          operations online.
        </div>
        <h1 className="text-5xl sm:text-7xl text-[#D1D0C5] leading-[1.1] font-medium">
          integrated
          <br />
          excellence.
        </h1>
        <p className="max-w-xl text-[#646669] font-mono text-sm leading-relaxed">
          managing scale seamlessly. a resilient ecosystem designed for minimal interference and absolute control.
        </p>

        <div className="flex items-center gap-8 mt-12 font-mono text-xs uppercase tracking-widest">
          <button className="text-[#F5A623] hover:text-[#D1D0C5] transition-colors active:scale-95">
            [ interface start ]
          </button>
          <span className="text-[#1A1A1A]">/</span>
          <button className="text-[#646669] hover:text-[#D1D0C5] transition-colors active:scale-95">
            contact.sys
          </button>
        </div>
      </div>
    </main>
  );
}
