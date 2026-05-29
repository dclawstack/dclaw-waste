export default function Hero() {
  return (
    <section className="hero-bg relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-24 pb-20">
      {/* Ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-500/15 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="pill pill-brand mb-6 inline-flex" style={{ background: "rgba(255,255,255,0.12)", color: "white" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          YC-Ready · v1.4 · AI-Powered
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6">
          Replace spreadsheets<br />
          <span className="text-transparent" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.4)" }}>with intelligence.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          DClaw Waste is the AI-powered operations platform for commercial waste management —
          from equipment leasing to ESG compliance, all in one place.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a href="#how-it-works"
            className="bg-white text-brand-800 font-bold text-base px-8 py-4 rounded-full hover:bg-brand-50 transition-all hover:scale-105 shadow-2xl">
            See How It Works
          </a>
          <a href="#features"
            className="glass text-white font-semibold text-base px-8 py-4 rounded-full hover:bg-white/15 transition-all">
            Explore Features →
          </a>
        </div>

        {/* Stats bar */}
        <div className="glass rounded-2xl px-8 py-6 inline-flex flex-wrap justify-center gap-8 md:gap-12">
          {[
            { value: "40%", label: "Landfill reduction" },
            { value: "25%", label: "Route cost savings" },
            { value: "100%", label: "ESG compliant" },
            { value: "< 60s", label: "Demo ready" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-white">{value}</div>
              <div className="text-xs text-white/50 font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="8" cy="8" r="2" fill="currentColor" className="animate-bounce"/>
        </svg>
      </div>
    </section>
  );
}
