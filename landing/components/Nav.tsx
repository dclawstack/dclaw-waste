export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-lg border-b border-white/10">
      {/* Logo */}
      <a href="#" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">DClaw Waste</span>
      </a>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        {["Features", "How it Works", "Pricing", "ESG"].map(item => (
          <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
            className="text-white/70 hover:text-white text-sm font-medium transition-colors">
            {item}
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <a href="/login" className="hidden md:block text-white/70 hover:text-white text-sm font-medium transition-colors">
          Sign in
        </a>
        <a href="/register"
          className="bg-white text-brand-800 font-semibold text-sm px-4 py-2 rounded-full hover:bg-brand-50 transition-colors">
          Start Free Trial
        </a>
      </div>
    </nav>
  );
}
