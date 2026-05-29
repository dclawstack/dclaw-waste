import { LOGIN_URL, REGISTER_URL } from "@/lib/links";

export default function CTA() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="hero-bg rounded-3xl px-8 md:px-16 py-16 text-center relative overflow-hidden">
          {/* Ambient blobs */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-500/15 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: "2s" }} />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
              Ready to ditch the spreadsheets?
            </h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
              Join the waste management companies running smarter operations with DClaw Waste.
              Set up takes 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={REGISTER_URL}
                className="bg-white text-brand-800 font-bold text-base px-8 py-4 rounded-full hover:bg-brand-50 transition-all hover:scale-105 shadow-2xl">
                Start Your Free Trial
              </a>
              <a href={LOGIN_URL}
                className="glass text-white font-semibold text-base px-8 py-4 rounded-full hover:bg-white/15 transition-all">
                Sign in to dashboard →
              </a>
            </div>
            <p className="text-white/40 text-sm mt-6">No credit card required · 14-day free trial</p>
          </div>
        </div>
      </div>
    </section>
  );
}
