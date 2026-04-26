export default function HeroSection() {
  return (
    <main className="relative flex-grow flex flex-col items-center justify-center min-h-[90vh] overflow-hidden p-12 text-center font-sans tracking-tight">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="/home/Land%20Rover%20Defender%20Puma%20110_1080p.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-[#0B0B0B]/70 z-10" />

      {/* Foreground Content */}
      <div className="relative z-20 max-w-3xl flex flex-col items-center gap-10">
        <h1 className="text-6xl sm:text-8xl text-[#D1D0C5] leading-[1.1] font-medium drop-shadow-2xl">
          Integrated
          <br />
          excellence.
        </h1>
        <p className="max-w-xl text-[#ffffff]/90 font-mono text-base leading-relaxed drop-shadow-md">
          Managing scale seamlessly. A resilient ecosystem designed for minimal
          interference and absolute control.
        </p>
      </div>
    </main>
  );
}
