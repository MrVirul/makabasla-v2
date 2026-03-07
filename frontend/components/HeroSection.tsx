export default function HeroSection() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center p-8 pt-32 text-center sm:p-20">
      <div className="flex flex-col items-center gap-12 max-w-4xl">
        {/* Decorative background glow */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_50%)]" />

        <div className="flex flex-col items-center gap-8 animate-reveal">
          <div className="px-5 py-2 rounded-full glass text-[10px] font-bold tracking-[0.2em] uppercase text-[#F5A623]/60 mb-4 animate-fade-in">
            Enterprise Ready Services
          </div>

          <h1 className="text-6xl sm:text-8xl font-black text-gradient leading-tight tracking-tighter">
            Integrated <br /> Excellence.
          </h1>

          <p className="max-w-xl text-lg sm:text-2xl text-[#CFCFCF] font-medium leading-relaxed">
            Managing appointments, billing, identity, and tasks has never been
            more seamless. The Makabasla ecosystem is built for scale.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <button className="h-16 px-12 rounded-full bg-[#F5A623] text-black font-bold hover:bg-[#C97A00] transition-all active:scale-95 glow shadow-[#F5A623]/20">
              Explore Services
            </button>
            <button className="h-16 px-12 rounded-full glass text-[#F5F5F5] font-semibold hover:bg-white/5 transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
