export default function Footer() {
  return (
    <footer className="w-full bg-[#0B0B0B] border-t border-[#1A1A1A] py-16 px-12 flex flex-col md:flex-row justify-between items-center text-[#646669] font-mono text-[11px] tracking-widest uppercase gap-8">
      <div>
        © {new Date().getFullYear()} Makabasla. All systems local.
      </div>
      <div className="flex gap-8">
        <a href="#" className="hover:text-[#D1D0C5] transition-colors">
          twitter
        </a>
        <a href="#" className="hover:text-[#D1D0C5] transition-colors">
          github
        </a>
      </div>
    </footer>
  );
}
