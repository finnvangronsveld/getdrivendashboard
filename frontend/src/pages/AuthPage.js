import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Car, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welkom terug!');
      } else {
        await register(email, password, name);
        toast.success('Account aangemaakt!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Er is iets misgegaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative" data-testid="auth-page">
      {/* BG */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1639060015191-9d83063eab2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBjYXIlMjBkYXNoYm9hcmQlMjBuaWdodCUyMGludGVyZmFjZXxlbnwwfHx8fDE3NzA4OTI0NjN8MA&ixlib=rb-4.1.0&q=85"
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-[#050505]/70" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          data-testid="auth-back-button"
          className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Terug
        </button>

        {/* Card */}
        <div className="bg-[#0F0F11]/80 backdrop-blur-xl border border-[#27272A] rounded-2xl p-8 animate-fadeInUp">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <Car className="w-7 h-7 text-[#D9F99D]" />
            <span className="font-black text-lg text-white tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>
              GET DRIVEN
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Chivo, sans-serif' }}>
            {isLogin ? 'Inloggen' : 'Account aanmaken'}
          </h2>
          <p className="text-zinc-500 text-sm mb-8">
            {isLogin ? 'Welkom terug, chauffeur.' : 'Maak een account om te beginnen.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Naam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  data-testid="auth-name-input"
                  className="w-full bg-[#09090B] border border-[#27272A] text-white h-12 rounded-lg pl-11 pr-4 placeholder:text-zinc-600 focus:border-[#D9F99D] focus:ring-1 focus:ring-[#D9F99D] transition-all outline-none"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="auth-email-input"
                className="w-full bg-[#09090B] border border-[#27272A] text-white h-12 rounded-lg pl-11 pr-4 placeholder:text-zinc-600 focus:border-[#D9F99D] focus:ring-1 focus:ring-[#D9F99D] transition-all outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="password"
                placeholder="Wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="auth-password-input"
                className="w-full bg-[#09090B] border border-[#27272A] text-white h-12 rounded-lg pl-11 pr-4 placeholder:text-zinc-600 focus:border-[#D9F99D] focus:ring-1 focus:ring-[#D9F99D] transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="auth-submit-button"
              className="w-full bg-[#D9F99D] text-black font-bold h-12 rounded-lg hover:bg-[#BEF264] hover:shadow-[0_0_20px_rgba(217,249,157,0.3)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                isLogin ? 'Inloggen' : 'Registreren'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              data-testid="auth-toggle-button"
              className="text-zinc-500 text-sm hover:text-[#D9F99D] transition-colors"
            >
              {isLogin ? 'Nog geen account? Registreer hier' : 'Al een account? Log hier in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
