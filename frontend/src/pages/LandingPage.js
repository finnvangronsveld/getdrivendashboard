import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ArrowRight, Clock, Calculator, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden" data-testid="landing-page">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1620043210840-64aad601b7b7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwxfHxjaGF1ZmZldXIlMjBkcml2aW5nJTIwbHV4dXJ5JTIwY2FyJTIwbmlnaHR8ZW58MHx8fHwxNzcwODkyNDYyfDA&ixlib=rb-4.1.0&q=85"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/80 to-[#050505]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 opacity-0 animate-fadeInUp" data-testid="landing-logo">
          <Car className="w-10 h-10 text-[#D9F99D] glow-lime-text" />
          <span className="text-zinc-500 text-sm font-medium tracking-[0.3em] uppercase" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Driver Tools
          </span>
        </div>

        {/* Main Title */}
        <h1
          className="text-5xl sm:text-6xl lg:text-8xl font-black text-center tracking-tighter leading-[0.9] mb-6 opacity-0 animate-fadeInUp stagger-1"
          style={{ fontFamily: 'Chivo, sans-serif' }}
          data-testid="landing-title"
        >
          <span className="text-white">GET DRIVEN</span>
          <br />
          <span className="text-[#D9F99D] glow-lime-text">DASHBOARD</span>
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-400 text-base sm:text-lg text-center max-w-md mb-12 opacity-0 animate-fadeInUp stagger-2">
          Bereken je loon, track je ritten en houd overzicht van je verdiensten als privedriver.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/auth')}
          data-testid="landing-cta-button"
          className="group flex items-center gap-3 bg-[#D9F99D] text-black font-bold not-italic px-8 py-4 rounded-none skew-x-[-10deg] hover:bg-[#BEF264] hover:shadow-[0_0_30px_rgba(217,249,157,0.4)] transition-all duration-300 opacity-0 animate-fadeInUp stagger-3"
        >
          <span className="skew-x-[10deg] flex items-center gap-2 text-lg not-italic">
            Aan de slag
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-3xl w-full opacity-0 animate-fadeInUp stagger-4">
          {[
            { icon: Clock, title: 'Uren Tracking', desc: 'Registreer start- en eindtijd per rit' },
            { icon: Calculator, title: 'Loonberekening', desc: 'Automatisch overuren & nachttarief' },
            { icon: BarChart3, title: 'Statistieken', desc: 'Overzicht van je verdiensten' },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center p-6 bg-[#0F0F11]/60 backdrop-blur-md border border-[#27272A] rounded-xl hover:border-[#D9F99D]/30 transition-colors"
            >
              <Icon className="w-8 h-8 text-[#D9F99D] mb-3" />
              <h3 className="text-white font-semibold text-sm mb-1" style={{ fontFamily: 'Chivo, sans-serif' }}>{title}</h3>
              <p className="text-zinc-500 text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
