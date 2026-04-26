export default function HeroSection() {
  return (
    <main className="relative flex-grow flex flex-col items-center justify-center min-h-[70vh] sm:min-h-[85vh] lg:min-h-[90vh] w-full overflow-hidden px-6 py-20 md:p-12 text-center font-sans tracking-tight">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center scale-105" // Slight scale to avoid any edge gaps
        >
          <source
            src="/home/Land%20Rover%20Defender%20Puma%20110_1080p.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-[#0B0B0B]/60 z-10" />

      {/* Foreground Content */}
      <div className="relative z-20 max-w-[1400px] flex flex-col items-center gap-6 md:gap-10">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#D1D0C5] leading-[1] font-medium drop-shadow-2xl tracking-tighter">
          A Legacy Rebuilt
          <br />
          <span className="text-gradient">not just a vehicle</span>
        </h1>
        <p className="max-w-xl text-[#ffffff]/70 font-mono text-sm md:text-base lg:text-lg leading-relaxed drop-shadow-md">
          The Legend of the Land Rover Defender Lives On
        </p>
      </div>
    </main>
  );
}
