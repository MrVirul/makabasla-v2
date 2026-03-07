export default function Footer() {
  return (
    <footer className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-zinc-900 flex justify-between items-center text-zinc-600">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-800">
        © {new Date().getFullYear()} Makabasla
      </div>
      <div className="flex gap-8 text-xs font-semibold">
        <a href="#" className="hover:text-white transition-colors">
          Twitter
        </a>
        <a href="#" className="hover:text-white transition-colors">
          GitHub
        </a>
      </div>
    </footer>
  );
}
